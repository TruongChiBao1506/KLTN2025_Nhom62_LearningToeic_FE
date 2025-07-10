// import React, { useState, useEffect } from "react";
// import {
//   Popover,
//   Button,
//   Space,
//   Input,
//   Typography,
//   Tag,
//   Tooltip,
//   message,
// } from "antd";
// import {
//   CakeSliceIcon,
//   Trash2,
//   Languages,
//   Copy,
//   Save,
//   Edit,
// } from "lucide-react";

// const { Text, Paragraph } = Typography;
// const { TextArea } = Input;

// /**
//  * TextHighlighter component for highlighting and translating text in exam questions
//  *
//  * Features:
//  * - Highlight selected text with different colors
//  * - Save highlights for review
//  * - Translate highlighted or selected text
//  * - Notes for highlighted sections
//  */
// const TextHighlighter = ({ children, containerRef }) => {
//   const [highlights, setHighlights] = useState([]);
//   const [selection, setSelection] = useState(null);
//   const [showPopover, setShowPopover] = useState(false);
//   const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });
//   const [translation, setTranslation] = useState("");
//   const [translating, setTranslating] = useState(false);
//   const [note, setNote] = useState("");
//   const [isEditingNote, setIsEditingNote] = useState(false);
//   const [highlightColor, setHighlightColor] = useState("#FFFF00"); // Yellow by default

//   const highlightColors = [
//     { color: "#FFFF00", name: "Yellow" },
//     { color: "#00FFFF", name: "Cyan" },
//     { color: "#FF00FF", name: "Magenta" },
//     { color: "#00FF00", name: "Green" },
//     { color: "#FFA500", name: "Orange" },
//   ];

//   // Handle text selection
//   useEffect(() => {
//     const handleTextSelection = () => {
//       const selection = window.getSelection();

//       if (selection.toString().trim().length > 0) {
//         // Check if selection is within our container
//         if (
//           containerRef.current &&
//           containerRef.current.contains(selection.anchorNode)
//         ) {
//           const range = selection.getRangeAt(0);
//           const rect = range.getBoundingClientRect();
//           const containerRect = containerRef.current.getBoundingClientRect();

//           setSelection({
//             text: selection.toString(),
//             range: range,
//           });

//           setPopoverPosition({
//             top: rect.bottom - containerRect.top + 5,
//             left: rect.left + rect.width / 2 - containerRect.left,
//           });

//           setShowPopover(true);
//           setTranslation("");
//           setNote("");
//           setIsEditingNote(false);
//         }
//       } else {
//         setShowPopover(false);
//       }
//     };

//     document.addEventListener("mouseup", handleTextSelection);

//     return () => {
//       document.removeEventListener("mouseup", handleTextSelection);
//     };
//   }, [containerRef]);

//   // Close popover when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (showPopover && !event.target.closest(".text-highlighter-popover")) {
//         setShowPopover(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [showPopover]);

//   // Add highlight to the selected text
//   const addHighlight = () => {
//     if (!selection) return;

//     const newHighlight = {
//       id: Date.now(),
//       text: selection.text,
//       color: highlightColor,
//       note: note,
//       translation: translation,
//     };

//     setHighlights([...highlights, newHighlight]);
//     setShowPopover(false);

//     // Create actual highlight in DOM
//     highlightSelection(selection.range, newHighlight.id, newHighlight.color);

//     message.success("Đã lưu highlight");
//   };

//   // Apply highlight to DOM
//   const highlightSelection = (range, id, color) => {
//     if (!range) return;

//     const highlightElement = document.createElement("span");
//     highlightElement.className = "text-highlight";
//     highlightElement.dataset.highlightId = id;
//     highlightElement.style.backgroundColor = color;
//     highlightElement.style.cursor = "pointer";

//     try {
//       range.surroundContents(highlightElement);

//       // Add click event to show the highlight details
//       highlightElement.addEventListener("click", (e) => {
//         e.stopPropagation();
//         const highlight = highlights.find(
//           (h) => h.id === parseInt(highlightElement.dataset.highlightId)
//         );
//         if (highlight) {
//           setSelection({ text: highlight.text });
//           setTranslation(highlight.translation || "");
//           setNote(highlight.note || "");
//           setHighlightColor(highlight.color);

//           const rect = highlightElement.getBoundingClientRect();
//           const containerRect = containerRef.current.getBoundingClientRect();

//           setPopoverPosition({
//             top: rect.bottom - containerRect.top + 5,
//             left: rect.left + rect.width / 2 - containerRect.left,
//           });

//           setShowPopover(true);
//           setIsEditingNote(false);
//         }
//       });
//     } catch (e) {
//       console.error("Error applying highlight:", e);
//       message.error("Không thể highlight đoạn văn bản đã chọn");
//     }
//   };

//   // Remove a highlight
//   const removeHighlight = (id) => {
//     // Remove from state
//     setHighlights(highlights.filter((h) => h.id !== id));

//     // Remove from DOM
//     const highlightElement = document.querySelector(
//       `.text-highlight[data-highlight-id="${id}"]`
//     );
//     if (highlightElement) {
//       // Replace with its text content
//       const textNode = document.createTextNode(highlightElement.textContent);
//       highlightElement.parentNode.replaceChild(textNode, highlightElement);
//     }

//     setShowPopover(false);
//     message.success("Đã xóa highlight");
//   };

//   // Translate selected text using Google Translate API
//   const translateText = async () => {
//     if (!selection?.text) return;

//     setTranslating(true);
//     try {
//       // This is a simple way to translate, in a production app you might want to use a proper translation API
//       const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(
//         selection.text
//       )}`;

//       const response = await fetch(url);
//       const data = await response.json();

//       if (data && data[0] && data[0][0] && data[0][0][0]) {
//         setTranslation(data[0][0][0]);
//       } else {
//         setTranslation("Không thể dịch đoạn văn bản này");
//       }
//     } catch (error) {
//       console.error("Translation error:", error);
//       setTranslation("Lỗi dịch: Hãy thử lại sau");
//     } finally {
//       setTranslating(false);
//     }
//   };

//   // Copy highlighted text to clipboard
//   const copyToClipboard = () => {
//     if (selection?.text) {
//       navigator.clipboard.writeText(selection.text);
//       message.success("Đã sao chép vào clipboard");
//     }
//   };

//   return (
//     <div className="text-highlighter-container">
//       {children}

//       {/* Popover for text selection */}
//       {showPopover && (
//         <div
//           className="text-highlighter-popover"
//           style={{
//             position: "absolute",
//             top: popoverPosition.top,
//             left: popoverPosition.left,
//             zIndex: 1000,
//             transform: "translateX(-50%)",
//           }}
//         >
//           <Popover
//             open={true}
//             title={
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                 }}
//               >
//                 <Text strong>Văn bản đã chọn</Text>
//                 <Button
//                   type="text"
//                   icon={<Trash2 size={16} />}
//                   onClick={() => {
//                     const highlightElement = document.querySelector(
//                       `.text-highlight[data-highlight-id="${selection.id}"]`
//                     );
//                     if (highlightElement) {
//                       removeHighlight(
//                         parseInt(highlightElement.dataset.highlightId)
//                       );
//                     } else {
//                       setShowPopover(false);
//                     }
//                   }}
//                 />
//               </div>
//             }
//             content={
//               <div style={{ width: 300 }}>
//                 <div style={{ marginBottom: 10 }}>
//                   <Paragraph
//                     ellipsis={{ rows: 2, expandable: true, symbol: "Xem thêm" }}
//                   >
//                     <Text>{selection?.text}</Text>
//                   </Paragraph>
//                 </div>

//                 {/* Color selection */}
//                 <div style={{ marginBottom: 10 }}>
//                   <Text
//                     type="secondary"
//                     style={{ display: "block", marginBottom: 5 }}
//                   >
//                     Màu highlight:
//                   </Text>
//                   <Space>
//                     {highlightColors.map((colorOption) => (
//                       <Tooltip key={colorOption.color} title={colorOption.name}>
//                         <div
//                           onClick={() => setHighlightColor(colorOption.color)}
//                           style={{
//                             width: 20,
//                             height: 20,
//                             backgroundColor: colorOption.color,
//                             border:
//                               colorOption.color === highlightColor
//                                 ? "2px solid #1890ff"
//                                 : "1px solid #d9d9d9",
//                             borderRadius: "4px",
//                             cursor: "pointer",
//                           }}
//                         />
//                       </Tooltip>
//                     ))}
//                   </Space>
//                 </div>

//                 {/* Translation */}
//                 <div style={{ marginBottom: 10 }}>
//                   <Space
//                     align="start"
//                     style={{ width: "100%", justifyContent: "space-between" }}
//                   >
//                     <Text type="secondary">Bản dịch:</Text>
//                     <Button
//                       size="small"
//                       icon={<Languages size={14} />}
//                       onClick={translateText}
//                       loading={translating}
//                     >
//                       Dịch
//                     </Button>
//                   </Space>
//                   {translation && (
//                     <Paragraph
//                       style={{
//                         padding: "8px",
//                         backgroundColor: "#f5f5f5",
//                         borderRadius: "4px",
//                         marginTop: "8px",
//                       }}
//                     >
//                       {translation}
//                     </Paragraph>
//                   )}
//                 </div>

//                 {/* Notes */}
//                 <div style={{ marginBottom: 10 }}>
//                   <Space
//                     align="start"
//                     style={{ width: "100%", justifyContent: "space-between" }}
//                   >
//                     <Text type="secondary">Ghi chú:</Text>
//                     <Button
//                       size="small"
//                       icon={
//                         isEditingNote ? <Save size={14} /> : <Edit size={14} />
//                       }
//                       onClick={() => setIsEditingNote(!isEditingNote)}
//                     >
//                       {isEditingNote ? "Lưu" : "Sửa"}
//                     </Button>
//                   </Space>
//                   {isEditingNote ? (
//                     <TextArea
//                       rows={2}
//                       value={note}
//                       onChange={(e) => setNote(e.target.value)}
//                       placeholder="Nhập ghi chú"
//                       style={{ marginTop: "8px" }}
//                     />
//                   ) : note ? (
//                     <Paragraph
//                       style={{
//                         padding: "8px",
//                         backgroundColor: "#f5f5f5",
//                         borderRadius: "4px",
//                         marginTop: "8px",
//                       }}
//                     >
//                       {note}
//                     </Paragraph>
//                   ) : (
//                     <Text
//                       type="secondary"
//                       italic
//                       style={{ display: "block", marginTop: "8px" }}
//                     >
//                       Chưa có ghi chú
//                     </Text>
//                   )}
//                 </div>

//                 {/* Actions */}
//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     marginTop: 15,
//                   }}
//                 >
//                   <Button
//                     icon={<Copy size={14} />}
//                     size="small"
//                     onClick={copyToClipboard}
//                   >
//                     Sao chép
//                   </Button>
//                   <Button
//                     icon={<CakeSliceIcon size={14} />}
//                     type="primary"
//                     onClick={addHighlight}
//                   >
//                     {selection.id ? "Cập nhật" : "Highlight"}
//                   </Button>
//                 </div>
//               </div>
//             }
//             trigger="click"
//             visible={showPopover}
//             onVisibleChange={setShowPopover}
//           />
//         </div>
//       )}
//     </div>
//   );
// };

// export default TextHighlighter;
