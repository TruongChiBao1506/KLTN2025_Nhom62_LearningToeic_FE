import React, { useState, useEffect, useRef } from 'react';

// Lazy load CKEditor
const EditorOptimized = ({ 
    data = '', 
    onChange, 
    onReady, 
    onBlur,
    placeholder = 'Nhập nội dung...',
    height = '300px'
}) => {
    const [CKEditor, setCKEditor] = useState(null);
    const [ClassicEditor, setClassicEditor] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const editorRef = useRef(null);

    // Lazy load CKEditor modules
    useEffect(() => {
        let isMounted = true;

        const loadCKEditor = async () => {
            try {
                console.log('🔄 Loading CKEditor modules...');
                
                // Dynamic import với timeout
                const loadTimeout = setTimeout(() => {
                    if (isMounted) {
                        setError('CKEditor loading timeout');
                        setIsLoading(false);
                    }
                }, 10000); // 10 second timeout

                const [ckEditorModule, classicEditorModule] = await Promise.all([
                    import('@ckeditor/ckeditor5-react'),
                    import('@ckeditor/ckeditor5-build-classic')
                ]);

                clearTimeout(loadTimeout);

                if (isMounted) {
                    setCKEditor(() => ckEditorModule.CKEditor);
                    setClassicEditor(() => classicEditorModule.default);
                    console.log('✅ CKEditor loaded successfully');
                }
            } catch (error) {
                console.error('❌ Error loading CKEditor:', error);
                if (isMounted) {
                    setError('Failed to load CKEditor');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadCKEditor();

        return () => {
            isMounted = false;
        };
    }, []);

    // Handle editor change with debounce
    const handleEditorChange = (event, editor) => {
        const content = editor.getData();
        
        // Debounce để tránh quá nhiều updates
        if (editorRef.current) {
            clearTimeout(editorRef.current);
        }
        
        editorRef.current = setTimeout(() => {
            if (onChange) {
                onChange(content);
            }
        }, 300);
    };

    // Handle editor ready
    const handleEditorReady = (editor) => {
        console.log('📝 CKEditor is ready');
        
        // Set editor height
        if (editor.editing?.view?.change) {
            editor.editing.view.change(writer => {
                writer.setStyle('min-height', height, editor.editing.view.document.getRoot());
            });
        }
        
        if (onReady) {
            onReady(editor);
        }
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (editorRef.current) {
                clearTimeout(editorRef.current);
            }
        };
    }, []);

    // Loading state
    if (isLoading) {
        return (
            <div className="text-center py-4 border rounded" style={{ minHeight: height }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted small">Đang tải trình soạn thảo...</p>
            </div>
        );
    }

    // Error state - Fallback to textarea
    if (error || !CKEditor || !ClassicEditor) {
        return (
            <div>
                <div className="alert alert-warning py-2">
                    <small>⚠️ CKEditor không thể tải. Sử dụng textarea thay thế.</small>
                </div>
                <textarea
                    className="form-control"
                    style={{ minHeight: height }}
                    value={data}
                    onChange={(e) => onChange && onChange(e.target.value)}
                    onBlur={onBlur}
                    placeholder={placeholder}
                />
            </div>
        );
    }

    // CKEditor component
    return (
        <CKEditor
            editor={ClassicEditor}
            data={data}
            onChange={handleEditorChange}
            onReady={handleEditorReady}
            onBlur={(event, editor) => {
                if (onBlur) {
                    onBlur(event, editor);
                }
            }}
            config={{
                toolbar: {
                    items: [
                        'heading', '|',
                        'bold', 'italic', 'link', '|',
                        'bulletedList', 'numberedList', '|',
                        'outdent', 'indent', '|',
                        'blockQuote', '|',
                        'undo', 'redo'
                    ]
                },
                heading: {
                    options: [
                        { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                        { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                        { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                        { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
                    ]
                },
                placeholder: placeholder,
                // Performance optimizations
                removePlugins: [
                    'EasyImage',
                    'ImageUpload',
                    'MediaEmbed',
                    'Table',
                    'TableToolbar'
                ],
                // Reduce bundle size
                language: 'en'
            }}
        />
    );
};

export default EditorOptimized;