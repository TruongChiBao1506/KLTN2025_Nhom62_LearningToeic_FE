import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button, Space, Input, Tooltip, message } from "antd";
import { Palette, Languages, X, MessageSquare } from "lucide-react";
import "./TextHighlighter.css";

const HIGHLIGHT_COLORS = [
  { name: "Yellow", value: "#fef08a" },
  { name: "Green", value: "#bbf7d0" },
  { name: "Blue", value: "#bae6fd" },
  { name: "Pink", value: "#fbcfe8" },
  { name: "Purple", value: "#ddd6fe" },
  { name: "Orange", value: "#fed7aa" },
];

const TextHighlighter = ({ children, containerId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const [currentColor, setCurrentColor] = useState(HIGHLIGHT_COLORS[0].value);
  const [note, setNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translation, setTranslation] = useState("");
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef(null);

  // Set mounted state
  useEffect(() => {
    setMounted(true);
    console.log("TextHighlighter mounted");
    return () => {
      setMounted(false);
      console.log("TextHighlighter unmounted");
    };
  }, []);

  // Reset state when popup closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setSelectedText("");
        setNote("");
        setShowNoteInput(false);
        setTranslation("");
        setIsTranslating(false);
      }, 300);
    }
  }, [isOpen]);

  // Handle text selection with improved positioning and debugging
  const handleTextSelection = useCallback(
    (e) => {
      if (!mounted) {
        console.log("Component not mounted yet");
        return;
      }

      try {
        const selection = window.getSelection();
        console.log(
          "Selection detected:",
          selection?.toString(),
          "Range count:",
          selection?.rangeCount
        );

        if (
          selection &&
          selection.toString().trim().length > 0 &&
          selection.rangeCount > 0
        ) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          console.log("Selection rect:", rect);

          // Check if selection is inside the container if containerId is provided
          if (containerId) {
            const container = document.getElementById(containerId);
            if (!container || !container.contains(selection.anchorNode)) {
              console.log("Selection not in container:", containerId);
              return;
            }
          }

          const selectedTextValue = selection.toString().trim();
          console.log("Selected text:", selectedTextValue);
          setSelectedText(selectedTextValue);

          // Calculate position relative to viewport (fixed positioning)
          const newPosition = {
            left: rect.left + rect.width / 2,
            top: rect.top - 10, // 10px above selected text
          };

          console.log("Calculated position:", newPosition);
          setPosition(newPosition);
          setIsOpen(true);
          console.log("Popup should be open now");
        } else {
          console.log("No valid selection, closing popup");
          setIsOpen(false);
        }
      } catch (error) {
        console.error("Error in handleTextSelection:", error);
        setIsOpen(false);
      }
    },
    [containerId, mounted]
  );

  useEffect(() => {
    if (!mounted) return;

    console.log("Adding mouseup event listener");
    document.addEventListener("mouseup", handleTextSelection);
    return () => {
      console.log("Removing mouseup event listener");
      document.removeEventListener("mouseup", handleTextSelection);
    };
  }, [handleTextSelection, mounted]);

  // Click outside handler to close popup
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      // Check if click is outside the popup
      const popup = document.querySelector(".toeic-highlighter-overlay");

      if (popup && !popup.contains(e.target)) {
        console.log("Clicked outside popup, closing");
        setIsOpen(false);
      }
    };

    // Add slight delay to prevent immediate closing when popup first opens
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 200);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Highlight the selected text
  const highlightText = () => {
    if (!selectedText) return;

    try {
      const selection = window.getSelection();

      // Check if there's still a valid selection
      if (!selection || selection.rangeCount === 0) {
        message.error("Please select text again to highlight");
        setIsOpen(false);
        return;
      }

      const range = selection.getRangeAt(0);

      // Create a span element to wrap the selected text
      const highlightSpan = document.createElement("span");
      highlightSpan.style.backgroundColor = currentColor;
      highlightSpan.className = "toeic-text-highlight";
      highlightSpan.dataset.note = note || "";
      highlightSpan.title = note ? `Note: ${note}` : "Highlighted text";

      range.surroundContents(highlightSpan);

      // Log highlight info for debugging
      console.log("Text highlighted:", {
        text: selectedText,
        color: currentColor,
        note: note,
        element: highlightSpan.outerHTML,
      });

      // Clear the selection and close the popup
      window.getSelection().removeAllRanges();
      setIsOpen(false);
      message.success("Text highlighted successfully");
    } catch (error) {
      console.error("Highlight error:", error);
      message.error(
        "Could not highlight text. Selections that span multiple elements are not supported."
      );
    }
  };

  // Translate the selected text
  const translateText = async () => {
    if (!selectedText) return;

    setIsTranslating(true);

    try {
      // Replace with your translation API
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&q=${encodeURIComponent(
          selectedText
        )}`
      );
      const data = await response.json();

      // Google Translate API returns a nested array structure
      if (data && data[0] && data[0][0]) {
        setTranslation(data[0][0][0]);
      } else {
        throw new Error("Translation failed");
      }
    } catch (error) {
      console.error("Translation error:", error);
      setTranslation("Could not translate text. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  // Content for the popover
  const popoverContent = (
    <div className="toeic-highlighter-popover">
      {translation ? (
        <div className="toeic-translation-result">
          <div
            className="toeic-translation-text"
            style={{
              padding: "8px 12px",
              backgroundColor: "#f6f8fa",
              borderRadius: "4px",
              marginBottom: "8px",
              fontSize: "14px",
            }}
          >
            {translation}
          </div>
          <Button
            type="text"
            icon={<X size={16} />}
            onClick={() => setTranslation("")}
            size="small"
          >
            Clear Translation
          </Button>
        </div>
      ) : (
        <>
          <div
            className="toeic-color-selector"
            style={{ marginBottom: "12px" }}
          >
            <div
              style={{ marginBottom: "8px", fontSize: "12px", color: "#666" }}
            >
              Choose highlight color:
            </div>
            <Space wrap>
              {HIGHLIGHT_COLORS.map((color) => (
                <Tooltip title={color.name} key={color.value}>
                  <div
                    className={`toeic-color-swatch ${
                      currentColor === color.value ? "active" : ""
                    }`}
                    style={{
                      backgroundColor: color.value,
                      width: "24px",
                      height: "24px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      border:
                        currentColor === color.value
                          ? "2px solid #1890ff"
                          : "2px solid transparent",
                      transition: "all 0.2s",
                    }}
                    onClick={() => setCurrentColor(color.value)}
                  />
                </Tooltip>
              ))}
            </Space>
          </div>

          {showNoteInput && (
            <div className="toeic-note-input" style={{ marginBottom: "12px" }}>
              <Input
                placeholder="Add a note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onPressEnter={() => highlightText()}
                size="small"
              />
            </div>
          )}

          <Space className="toeic-action-buttons" size="small" wrap>
            <Button
              type="primary"
              icon={<Palette size={16} />}
              onClick={highlightText}
              size="small"
            >
              Highlight
            </Button>

            <Button
              icon={<MessageSquare size={16} />}
              onClick={() => setShowNoteInput(!showNoteInput)}
              type={showNoteInput ? "primary" : "default"}
              size="small"
            >
              Note
            </Button>

            <Button
              icon={<Languages size={16} />}
              onClick={translateText}
              loading={isTranslating}
              size="small"
            >
              Translate
            </Button>
          </Space>
        </>
      )}
    </div>
  );

  return (
    <div
      ref={containerRef}
      className="toeic-text-highlighter-container"
      style={{ position: "relative" }}
    >
      {/* Debug info */}
      {process.env.NODE_ENV === "development" && (
        <div
          style={{
            position: "fixed",
            top: 10,
            right: 10,
            background: "yellow",
            padding: "5px",
            zIndex: 10000,
            fontSize: "12px",
          }}
        >
          isOpen: {isOpen ? "true" : "false"}
          <br />
          selectedText: {selectedText}
          <br />
          position: {position.left},{position.top}
          <br />
          mounted: {mounted ? "true" : "false"}
        </div>
      )}

      {/* Main content */}
      <div className="toeic-highlightable-content">{children}</div>

      {/* Popup - hiển thị khi có text được chọn */}
      {isOpen && selectedText && (
        <div
          style={{
            position: "fixed",
            left: position.left,
            top: position.top,
            transform: "translateX(-50%) translateY(-100%)",
            zIndex: 9999,
            backgroundColor: "white",
            border: "1px solid #d9d9d9",
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            padding: "16px",
            minWidth: "320px",
            maxWidth: "400px",
            animation: "fadeIn 0.2s ease-out",
          }}
          className="toeic-highlighter-overlay"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Arrow pointer */}
          <div
            style={{
              position: "absolute",
              bottom: "-8px",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "8px solid white",
              filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
            }}
          />

          {/* Popup header */}
          <div
            style={{
              marginBottom: "12px",
              paddingBottom: "8px",
              borderBottom: "1px solid #f0f0f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <strong>Selected Text: </strong>
              <span style={{ color: "#1890ff", fontSize: "14px" }}>
                {selectedText}
              </span>
            </div>
            <Button
              type="text"
              icon={<X size={16} />}
              onClick={() => setIsOpen(false)}
              size="small"
              style={{ marginLeft: "8px" }}
            />
          </div>

          {/* Popup content */}
          {popoverContent}
        </div>
      )}

      {/* CSS for animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-100%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(-100%) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default TextHighlighter;
