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
  // Initialize state
  const [isOpen, setIsOpen] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const [currentColor, setCurrentColor] = useState(HIGHLIGHT_COLORS[0].value);
  const [note, setNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translation, setTranslation] = useState("");

  // Initialize ref with null - this will be used to reference the container element
  const containerRef = useRef(null);

  // Add a check to ensure the component is mounted
  const [mounted, setMounted] = useState(false);

  // Set mounted to true after component mounts
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
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

  // Handle text selection
  // Helper function to check if a selection spans block-level elements
  const isComplexSelection = (range) => {
    if (!range) return false;

    // Check if start and end containers are different block elements
    const isStartBlock =
      range.startContainer.nodeType === Node.ELEMENT_NODE &&
      window.getComputedStyle(range.startContainer).display === "block";
    const isEndBlock =
      range.endContainer.nodeType === Node.ELEMENT_NODE &&
      window.getComputedStyle(range.endContainer).display === "block";

    if (isStartBlock !== isEndBlock) return true;

    // Check if selection spans multiple block elements
    if (range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE) {
      const ancestor = range.commonAncestorContainer;
      const blockElements = ancestor.querySelectorAll(
        "p, div, h1, h2, h3, h4, h5, h6, li, table"
      );

      let spanningBlocks = 0;
      for (const el of blockElements) {
        if (range.intersectsNode(el)) spanningBlocks++;
        if (spanningBlocks > 1) return true;
      }
    }

    return false;
  };

  const handleTextSelection = useCallback(
    (e) => {
      try {
        // Don't proceed if component is not mounted or containerRef is not available
        if (!mounted || !containerRef) {
          console.error("Component not ready or containerRef is undefined");
          return;
        }

        const selection = window.getSelection();

        if (
          !selection ||
          selection.toString().trim().length <= 0 ||
          selection.rangeCount === 0
        ) {
          setIsOpen(false);
          return;
        }

        const range = selection.getRangeAt(0);
        if (!range) {
          setIsOpen(false);
          return;
        }

        // Don't open highlighter for complex selections that will likely fail
        if (isComplexSelection(range)) {
          console.warn("Complex selection detected that spans block elements");
          // We could show a message here, but for now just prevent the popup
          return;
        }

        const rect = range.getBoundingClientRect();

        // Check if selection is inside the container if containerId is provided
        if (containerId) {
          const container = document.getElementById(containerId);
          if (!container || !container.contains(selection.anchorNode)) {
            return;
          }
        }

        setSelectedText(selection.toString().trim());

        // Calculate position for the popup - always use fallback values as base
        const containerRect = { left: 0, top: 0 };

        // Only try to get containerRect if containerRef.current exists
        if (containerRef.current) {
          const tempRect = containerRef.current.getBoundingClientRect();
          if (tempRect) {
            containerRect.left = tempRect.left;
            containerRect.top = tempRect.top;
          }
        }

        setPosition({
          left: rect.left + rect.width / 2 - containerRect.left,
          top: rect.top - containerRect.top - 10,
        });

        setIsOpen(true);
      } catch (error) {
        console.error("Error in text selection:", error);
        setIsOpen(false);
      }
    },
    [containerId, mounted]
  );

  useEffect(() => {
    // Only add event listener if component is mounted and containerRef exists
    if (mounted && containerRef) {
      // Add a small delay to ensure DOM is fully ready
      const timer = setTimeout(() => {
        document.addEventListener("mouseup", handleTextSelection);
      }, 100);

      return () => {
        clearTimeout(timer);
        document.removeEventListener("mouseup", handleTextSelection);
      };
    }
  }, [handleTextSelection, containerRef, mounted]);

  // Highlight the selected text
  const highlightText = () => {
    if (!selectedText) return;

    try {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        message.error("No text selected");
        return;
      }

      const range = selection.getRangeAt(0);
      if (!range) {
        message.error("Invalid selection range");
        return;
      }

      // Check if selection is within valid container
      try {
        if (containerId) {
          const container = document.getElementById(containerId);
          if (!container) {
            message.error("Container not found");
            return;
          }

          // Check if selection is entirely within container
          if (!container.contains(range.commonAncestorContainer)) {
            message.error("Selection must be entirely within the content area");
            return;
          }
        }
      } catch (checkError) {
        console.warn("Error checking selection validity:", checkError);
      }

      // Create a span element to wrap the selected text
      const highlightSpan = document.createElement("span");
      highlightSpan.style.backgroundColor = currentColor;
      highlightSpan.className = "toeic-text-highlight";
      highlightSpan.dataset.note = note || "";
      highlightSpan.title = note ? `Note: ${note}` : "Highlighted text";

      try {
        // First try the simple approach for simple text node selections
        if (
          range.startContainer === range.endContainer &&
          range.startContainer.nodeType === Node.TEXT_NODE
        ) {
          try {
            range.surroundContents(highlightSpan);
          } catch (simpleError) {
            console.warn("Simple highlight failed:", simpleError);
            throw simpleError; // Let the more complex method handle it
          }
        } else {
          // For more complex selections, use this approach
          console.log(
            "Using complex highlighting approach for multi-node selection"
          );

          // Extract the content and wrap it
          const fragment = range.extractContents();
          highlightSpan.appendChild(fragment);
          range.insertNode(highlightSpan);

          // Clean up potentially empty text nodes
          highlightSpan.normalize();
        }

        // Fix any broken DOM structures
        if (highlightSpan.parentNode) {
          highlightSpan.parentNode.normalize();
        }

        // Log highlight info for debugging
        console.log("Text highlighted:", {
          text: selectedText,
          color: currentColor,
          note: note,
          element: highlightSpan.outerHTML,
        });

        // Clear the selection and close the popup
        if (window.getSelection()) {
          window.getSelection().removeAllRanges();
        }
        setIsOpen(false);
        message.success("Text highlighted");
      } catch (error) {
        console.error("Error highlighting text:", error);
        message.error(
          "Could not highlight text. Please try selecting a smaller portion of text."
        );
      }
    } catch (outerError) {
      console.error("Unexpected error in highlightText:", outerError);
      message.error("An unexpected error occurred while highlighting text");
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
      {mounted ? (
        <Popover
          content={popoverContent}
          open={isOpen}
          onOpenChange={setIsOpen}
          trigger="click"
          placement="top"
          overlayClassName="toeic-highlighter-overlay"
          destroyTooltipOnHide
          getPopupContainer={() => {
            try {
              // Only attempt to use containerRef if it's available
              if (containerRef && containerRef.current) {
                return containerRef.current;
              }
              return document.body;
            } catch (err) {
              console.error("Error getting popup container:", err);
              return document.body;
            }
          }}
          overlayStyle={{
            position: "absolute",
            left: `${position.left}px`,
            top: `${position.top}px`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="toeic-highlightable-content">{children}</div>
        </Popover>
      ) : (
        <div className="toeic-highlightable-content">{children}</div>
      )}
    </div>
  );
};

export default TextHighlighter;
