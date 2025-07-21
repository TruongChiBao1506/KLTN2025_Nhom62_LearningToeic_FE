import React, { useState, useEffect, useCallback, useRef } from "react";
import { Popover, Button, Space, Input, Tooltip, message, Divider } from "antd";
import {
  Palette,
  Languages,
  X,
  Plus,
  MessageSquare,
  Check,
} from "lucide-react";
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
  const containerRef = useRef(null);

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

  // Handle text selection
  const handleTextSelection = useCallback(
    (e) => {
      const selection = window.getSelection();

      if (selection.toString().trim().length > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Check if selection is inside the container if containerId is provided
        if (containerId) {
          const container = document.getElementById(containerId);
          if (!container || !container.contains(selection.anchorNode)) {
            return;
          }
        }

        setSelectedText(selection.toString().trim());

        // Calculate position for the popup - use fallback values if containerRef is not available
        const containerRect = containerRef.current?.getBoundingClientRect() || {
          left: 0,
          top: 0,
        };
        setPosition({
          left: rect.left + rect.width / 2 - containerRect.left,
          top: rect.top - containerRect.top - 10,
        });

        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    },
    [containerId]
  );

  useEffect(() => {
    document.addEventListener("mouseup", handleTextSelection);
    return () => {
      document.removeEventListener("mouseup", handleTextSelection);
    };
  }, [handleTextSelection]);

  // Highlight the selected text
  const highlightText = () => {
    if (!selectedText) return;

    const selection = window.getSelection();
    const range = selection.getRangeAt(0);

    // Create a span element to wrap the selected text
    const highlightSpan = document.createElement("span");
    highlightSpan.style.backgroundColor = currentColor;
    highlightSpan.className = "toeic-text-highlight";
    highlightSpan.dataset.note = note || "";
    highlightSpan.title = note ? `Note: ${note}` : "Highlighted text";

    try {
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
      message.success("Text highlighted");
    } catch (error) {
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
          <div className="toeic-translation-text">{translation}</div>
          <Button
            type="text"
            icon={<X size={16} />}
            onClick={() => setTranslation("")}
            className="toeic-close-translation"
          />
        </div>
      ) : (
        <>
          <div className="toeic-color-selector">
            <Space wrap>
              {HIGHLIGHT_COLORS.map((color) => (
                <Tooltip title={color.name} key={color.value}>
                  <div
                    className={`toeic-color-swatch ${
                      currentColor === color.value ? "active" : ""
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setCurrentColor(color.value)}
                  />
                </Tooltip>
              ))}
            </Space>
          </div>

          {showNoteInput && (
            <div className="toeic-note-input">
              <Input
                placeholder="Add a note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onPressEnter={() => highlightText()}
              />
            </div>
          )}

          <Divider style={{ margin: "8px 0" }} />

          <Space className="toeic-action-buttons">
            <Button
              type="primary"
              icon={<Palette size={16} />}
              onClick={highlightText}
            >
              Highlight
            </Button>

            <Button
              icon={<MessageSquare size={16} />}
              onClick={() => setShowNoteInput(!showNoteInput)}
              type={showNoteInput ? "primary" : "default"}
            >
              {showNoteInput ? <Check size={16} /> : <Plus size={16} />} Note
            </Button>

            <Button
              icon={<Languages size={16} />}
              onClick={translateText}
              loading={isTranslating}
            >
              Translate
            </Button>
          </Space>
        </>
      )}
    </div>
  );

  return (
    <div ref={containerRef} className="toeic-text-highlighter-container">
      <Popover
        content={popoverContent}
        open={isOpen}
        onOpenChange={setIsOpen}
        trigger="click"
        placement="top"
        overlayClassName="toeic-highlighter-overlay"
        destroyTooltipOnHide
        getPopupContainer={() => containerRef.current || document.body}
        overlayStyle={{
          position: "absolute",
          left: `${position.left}px`,
          top: `${position.top}px`,
          transform: "translateX(-50%)",
        }}
      >
        <div className="toeic-highlightable-content">{children}</div>
      </Popover>
    </div>
  );
};

export default TextHighlighter;
