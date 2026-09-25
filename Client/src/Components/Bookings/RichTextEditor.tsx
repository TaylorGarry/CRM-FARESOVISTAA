// import React, { useRef } from 'react';
// import { useEditor, EditorContent } from '@tiptap/react';
// import StarterKit from '@tiptap/starter-kit';
// import Underline from '@tiptap/extension-underline';
// import Link from '@tiptap/extension-link';
// import { TextStyle } from '@tiptap/extension-text-style';
// import { Color } from '@tiptap/extension-color';
// import Image from '@tiptap/extension-image';
// import toast from 'react-hot-toast';
// import { bookingApi } from '../../services/bookingApi';

// interface RichTextEditorProps {
//   value: string;
//   onChange: (html: string) => void;
//   placeholder?: string;
//   minHeight?: number;
// }

// const btnBase =
//   'px-2 h-8 text-xs rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition';
// const btnActive = 'bg-sky-50 text-sky-600 border-sky-200';

// const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// const RichTextEditor: React.FC<RichTextEditorProps> = ({
//   value,
//   onChange,
//   placeholder = 'Itinerary content and screenshots here...',
//   minHeight = 220,
// }) => {
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   /* --------------------------------------------------------------- */
//   /* Upload helper — shared by button, paste and drop                 */
//   /* --------------------------------------------------------------- */
//   const uploadAndInsert = async (file: File) => {
//     if (!file.type.startsWith('image/')) {
//       toast.error('Only image files are allowed');
//       return;
//     }
//     if (file.size > MAX_FILE_SIZE) {
//       toast.error('Image must be under 5 MB');
//       return;
//     }

//     const toastId = toast.loading('Uploading image...');
//     try {
//       const res = await bookingApi.uploadItineraryImage(file);
//       if (res.data.success && res.data.url && editorRef.current) {
//         editorRef.current
//           .chain()
//           .focus()
//           .setImage({ src: res.data.url })
//           .run();
//         toast.success('Image inserted', { id: toastId });
//       } else {
//         toast.error('Upload failed', { id: toastId });
//       }
//     } catch (err: any) {
//       toast.error(err?.response?.data?.message || 'Upload failed', { id: toastId });
//     }
//   };

//   /* --------------------------------------------------------------- */
//   /* Editor                                                           */
//   /* --------------------------------------------------------------- */
//   const editorRef = useRef<ReturnType<typeof useEditor> | null>(null);

//   const editor = useEditor({
//     extensions: [
//       StarterKit.configure({
//         heading: { levels: [1, 2, 3] },
//       }),
//       Underline,
//       Link.configure({ openOnClick: false, autolink: true }),
//       TextStyle,
//       Color,
//       Image.configure({
//         inline: false,
//         allowBase64: false, // force uploads, no giant base64 blobs
//         HTMLAttributes: {
//           class: 'rounded-md border border-slate-200 max-w-full h-auto',
//         },
//       }),
//     ],
//     content: value || '',
//     onUpdate: ({ editor }) => {
//       onChange(editor.getHTML());
//     },
//     editorProps: {
//       attributes: {
//         class:
//           'prose prose-sm max-w-none focus:outline-none px-3 py-2 text-sm text-slate-700',
//         style: `min-height: ${minHeight}px`,
//         'data-placeholder': placeholder,
//       },
//       /* -------- Paste: intercept image paste -------- */
//       handlePaste(view, event) {
//         const items = Array.from(event.clipboardData?.items || []);
//         const imageItem = items.find((i) => i.type.startsWith('image/'));
//         if (imageItem) {
//           const file = imageItem.getAsFile();
//           if (file) {
//             uploadAndInsert(file);
//             return true;
//           }
//         }
//         return false;
//       },
//       /* -------- Drop: intercept image drop -------- */
//       handleDrop(view, event) {
//         const file = event.dataTransfer?.files?.[0];
//         if (file && file.type.startsWith('image/')) {
//           event.preventDefault();
//           uploadAndInsert(file);
//           return true;
//         }
//         return false;
//       },
//     },
//   });

//   // Keep a stable reference so uploadAndInsert can access the current editor
//   React.useEffect(() => {
//     editorRef.current = editor;
//   }, [editor]);

//   if (!editor) return null;

//   /* --------------------------------------------------------------- */
//   /* Toolbar helpers                                                  */
//   /* --------------------------------------------------------------- */
//   const setLink = () => {
//     const previous = editor.getAttributes('link').href;
//     const url = window.prompt('Enter URL', previous || 'https://');
//     if (url === null) return;
//     if (url === '') {
//       editor.chain().focus().extendMarkRange('link').unsetLink().run();
//       return;
//     }
//     editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
//   };

//   const setColor = (color: string) => {
//     editor.chain().focus().setColor(color).run();
//   };

//   const handleImageButton = () => {
//     fileInputRef.current?.click();
//   };

//   const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     e.target.value = ''; // allow selecting the same file again
//     if (file) uploadAndInsert(file);
//   };

//   /* --------------------------------------------------------------- */
//   /* Resize selected image                                            */
//   /* --------------------------------------------------------------- */
//   const resizeSelectedImage = (deltaPercent: number) => {
//     const { state, view } = editor;
//     const { selection } = state;
//     const node = (selection as any).node;

//     if (!node || node.type.name !== 'image') {
//       toast.error('Click on an image first to resize it');
//       return;
//     }

//     const currentWidth = parseInt(node.attrs.width || '0', 10) || 0;
//     const fallback =
//       typeof window !== 'undefined' ? Math.round(window.innerWidth * 0.6) : 600;

//     const baseWidth = currentWidth || fallback;
//     const nextWidth = Math.max(
//       80,
//       Math.min(2000, Math.round(baseWidth * (1 + deltaPercent / 100)))
//     );

//     editor
//       .chain()
//       .focus()
//       .updateAttributes('image', { width: String(nextWidth) })
//       .run();
//   };

//   return (
//     <div className="w-full border border-slate-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-sky-500">
//       {/* Hidden file input for image upload */}
//       <input
//         ref={fileInputRef}
//         type="file"
//         accept="image/*"
//         className="hidden"
//         onChange={handleFileInputChange}
//       />

//       {/* Toolbar */}
//       <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
//         <button
//           type="button"
//           onClick={() => editor.chain().focus().toggleBold().run()}
//           className={`${btnBase} ${editor.isActive('bold') ? btnActive : ''} font-bold`}
//           title="Bold"
//         >
//           B
//         </button>
//         <button
//           type="button"
//           onClick={() => editor.chain().focus().toggleItalic().run()}
//           className={`${btnBase} ${editor.isActive('italic') ? btnActive : ''} italic`}
//           title="Italic"
//         >
//           I
//         </button>
//         <button
//           type="button"
//           onClick={() => editor.chain().focus().toggleUnderline().run()}
//           className={`${btnBase} ${editor.isActive('underline') ? btnActive : ''} underline`}
//           title="Underline"
//         >
//           U
//         </button>

//         <span className="w-px h-5 bg-slate-200 mx-1" />

//         <button
//           type="button"
//           onClick={() => editor.chain().focus().toggleBulletList().run()}
//           className={`${btnBase} ${editor.isActive('bulletList') ? btnActive : ''}`}
//           title="Bullet list"
//         >
//           • List
//         </button>
//         <button
//           type="button"
//           onClick={() => editor.chain().focus().toggleOrderedList().run()}
//           className={`${btnBase} ${editor.isActive('orderedList') ? btnActive : ''}`}
//           title="Numbered list"
//         >
//           1. List
//         </button>

//         <span className="w-px h-5 bg-slate-200 mx-1" />

//         <button
//           type="button"
//           onClick={() => editor.chain().focus().toggleBlockquote().run()}
//           className={`${btnBase} ${editor.isActive('blockquote') ? btnActive : ''}`}
//           title="Quote"
//         >
//           ❝
//         </button>
//         <button
//           type="button"
//           onClick={() => editor.chain().focus().setHorizontalRule().run()}
//           className={btnBase}
//           title="Horizontal rule"
//         >
//           ―
//         </button>

//         <span className="w-px h-5 bg-slate-200 mx-1" />

//         <button
//           type="button"
//           onClick={setLink}
//           className={`${btnBase} ${editor.isActive('link') ? btnActive : ''}`}
//           title="Link"
//         >
//           🔗
//         </button>
//         <button
//           type="button"
//           onClick={() => editor.chain().focus().unsetLink().run()}
//           className={btnBase}
//           title="Remove link"
//         >
//           ⛓️‍💥
//         </button>

//         {/* ---------- Image button ---------- */}
//         <span className="w-px h-5 bg-slate-200 mx-1" />
//         <button
//           type="button"
//           onClick={handleImageButton}
//           className={btnBase}
//           title="Insert image (from computer)"
//         >
//           🖼️ Image
//         </button>
//         <button
//           type="button"
//           onClick={() => resizeSelectedImage(10)}
//           className={btnBase}
//           title="Enlarge selected image"
//         >
//           +
//         </button>
//         <button
//           type="button"
//           onClick={() => resizeSelectedImage(-10)}
//           className={btnBase}
//           title="Shrink selected image"
//         >
//           −
//         </button>

//         <span className="w-px h-5 bg-slate-200 mx-1" />

//         <div className="flex items-center gap-1">
//           {['#0f172a', '#dc2626', '#0284c7', '#16a34a', '#ca8a04'].map((c) => (
//             <button
//               key={c}
//               type="button"
//               onClick={() => setColor(c)}
//               className="w-5 h-5 rounded border border-slate-200"
//               style={{ backgroundColor: c }}
//               title={`Text color ${c}`}
//             />
//           ))}
//         </div>

//         <span className="w-px h-5 bg-slate-200 mx-1" />

//         <button
//           type="button"
//           onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
//           className={btnBase}
//           title="Clear formatting"
//         >
//           Clear
//         </button>
//         <button
//           type="button"
//           onClick={() => editor.chain().focus().undo().run()}
//           className={btnBase}
//           title="Undo"
//         >
//           ↶
//         </button>
//         <button
//           type="button"
//           onClick={() => editor.chain().focus().redo().run()}
//           className={btnBase}
//           title="Redo"
//         >
//           ↷
//         </button>
//       </div>

//       {/* Editor area */}
//       <div className="bg-white">
//         <EditorContent editor={editor} />
//       </div>

//       <style>{`
//         .ProseMirror p.is-editor-empty:first-child::before {
//           content: attr(data-placeholder);
//           float: left;
//           color: #94a3b8;
//           pointer-events: none;
//           height: 0;
//         }
//         .ProseMirror { min-height: inherit; }
//         .ProseMirror ul { list-style: disc; padding-left: 1.25rem; }
//         .ProseMirror ol { list-style: decimal; padding-left: 1.25rem; }
//         .ProseMirror blockquote {
//           border-left: 3px solid #cbd5e1; padding-left: 0.75rem; color: #475569;
//         }
//         .ProseMirror hr { border-color: #e2e8f0; margin: 0.75rem 0; }
//         .ProseMirror a { color: #0284c7; text-decoration: underline; }
//         .ProseMirror img {
//           max-width: 100%;
//           height: auto;
//           border-radius: 6px;
//           border: 1px solid #e2e8f0;
//           margin: 8px 0;
//         }
//         .ProseMirror img.ProseMirror-selectednode {
//           outline: 2px solid #0284c7;
//           outline-offset: 2px;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default RichTextEditor;




import React, { useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';
import toast from 'react-hot-toast';
import { bookingApi } from '../../services/bookingApi';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const btnBase =
  'px-2 h-8 text-xs rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition';
const btnActive = 'bg-sky-50 text-sky-600 border-sky-200';

const MAX_FILE_SIZE = 5 * 1024 * 1024; 
const MAX_FILES_PER_BATCH = 10;

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Itinerary content and screenshots here...',
  minHeight = 220,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<ReturnType<typeof useEditor> | null>(null);
  const [selectedImagePos, setSelectedImagePos] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string>('');

  /* --------------------------------------------------------------- */
  /* Upload helper — shared by button, paste and drop                 */
  /* --------------------------------------------------------------- */
  const uploadAndInsertMany = async (files: File[]) => {
    if (files.length === 0) return;

    if (files.length > MAX_FILES_PER_BATCH) {
      toast.error(`Please upload at most ${MAX_FILES_PER_BATCH} images at once`);
      return;
    }

    for (const f of files) {
      if (!f.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
        return;
      }
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`${f.name} is over 5 MB`);
        return;
      }
    }

    const toastId = toast.loading(
      files.length > 1 ? `Uploading ${files.length} images...` : 'Uploading image...'
    );

    setIsUploading(true);
    setUploadMessage(
      files.length > 1 ? `Uploading ${files.length} images…` : 'Uploading image…'
    );

    try {
      const res = await bookingApi.uploadItineraryImage(files);

      const ed = editorRef.current;
      if (!ed) {
        toast.error('Editor not ready', { id: toastId });
        return;
      }

      if (res.data.success && res.data.images?.length) {
        for (const img of res.data.images) {
          ed.chain().focus().setImage({ src: img.url }).run();
        }

        toast.success(
          files.length > 1 ? `${files.length} images inserted` : 'Image inserted',
          { id: toastId }
        );
      } else {
        toast.error('Upload failed', { id: toastId });
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Upload failed', { id: toastId });
    } finally {
      setIsUploading(false);
      setUploadMessage('');
    }
  };

  /* --------------------------------------------------------------- */
  /* Editor                                                           */
  /* --------------------------------------------------------------- */
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      TextStyle,
      Color,
      Image.configure({
        inline: false,
        allowBase64: false,
        HTMLAttributes: {
          class: 'rounded-md border border-slate-200 max-w-full h-auto',
        },
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      const selection = editor.state.selection as any;
      setSelectedImagePos(
        selection.node?.type?.name === 'image' ? selection.from : null
      );
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none focus:outline-none px-3 py-2 text-sm text-slate-700',
        style: `min-height: ${minHeight}px`,
        'data-placeholder': placeholder,
      },
      handlePaste(_view, event) {
        const items = Array.from(event.clipboardData?.items || []);
        const imageFiles: File[] = [];
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            const f = item.getAsFile();
            if (f) imageFiles.push(f);
          }
        }
        if (imageFiles.length > 0) {
          uploadAndInsertMany(imageFiles);
          return true;
        }
        return false;
      },
      handleDrop(_view, event) {
        const files = Array.from(event.dataTransfer?.files || []);
        const imageFiles = files.filter((f) => f.type.startsWith('image/'));
        if (imageFiles.length > 0) {
          event.preventDefault();
          uploadAndInsertMany(imageFiles);
          return true;
        }
        return false;
      },
    },
  });

  React.useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  if (!editor) return null;

  /* --------------------------------------------------------------- */
  /* Toolbar helpers                                                  */
  /* --------------------------------------------------------------- */
  const setLink = () => {
    const previous = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', previous || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const setColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
  };

  const handleImageButton = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = '';
    if (files.length > 0) uploadAndInsertMany(files);
  };

  const handleReplaceImage = () => {
    if (selectedImagePos === null) {
      toast.error('Click on an image first to replace it');
      return;
    }
    replaceFileInputRef.current?.click();
  };

  const handleReplaceImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';

    if (!file || selectedImagePos === null) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`${file.name} is over 5 MB`);
      return;
    }

    setIsUploading(true);
    setUploadMessage('Replacing image…');

    try {
      const res = await bookingApi.uploadItineraryImage([file]);
      const imageUrl = res.data.images?.[0]?.url;
      const selectedNode = editor.state.doc.nodeAt(selectedImagePos);

      if (
        !res.data.success ||
        !imageUrl ||
        selectedNode?.type.name !== 'image'
      ) {
        toast.error('Image replacement failed');
        return;
      }

      editor
        .chain()
        .focus()
        .setNodeSelection(selectedImagePos)
        .updateAttributes('image', { src: imageUrl })
        .run();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Image replacement failed');
    } finally {
      setIsUploading(false);
      setUploadMessage('');
    }
  };

  const handleDeleteImage = () => {
    if (selectedImagePos === null) {
      toast.error('Click on an image first to delete it');
      return;
    }

    const selectedNode = editor.state.doc.nodeAt(selectedImagePos);
    if (selectedNode?.type.name !== 'image') {
      toast.error('Click on an image first to delete it');
      return;
    }

    editor
      .chain()
      .focus()
      .setNodeSelection(selectedImagePos)
      .deleteSelection()
      .run();
  };

  /* --------------------------------------------------------------- */
  /* Resize selected image                                            */
  /* --------------------------------------------------------------- */
  const resizeSelectedImage = (deltaPercent: number) => {
    const { state } = editor;
    const { selection } = state;
    const node = (selection as any).node;

    if (!node || node.type.name !== 'image') {
      toast.error('Click on an image first to resize it');
      return;
    }

    const currentWidth = parseInt(node.attrs.width || '0', 10) || 0;
    const fallback =
      typeof window !== 'undefined' ? Math.round(window.innerWidth * 0.6) : 600;

    const baseWidth = currentWidth || fallback;
    const nextWidth = Math.max(
      80,
      Math.min(2000, Math.round(baseWidth * (1 + deltaPercent / 100)))
    );

    editor
      .chain()
      .focus()
      .updateAttributes('image', { width: String(nextWidth) })
      .run();
  };

  return (
    <div className="w-full border border-slate-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-sky-500">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />
      <input
        ref={replaceFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleReplaceImageChange}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${btnBase} ${editor.isActive('bold') ? btnActive : ''} font-bold`}
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${btnBase} ${editor.isActive('italic') ? btnActive : ''} italic`}
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`${btnBase} ${editor.isActive('underline') ? btnActive : ''} underline`}
          title="Underline"
        >
          U
        </button>

        <span className="w-px h-5 bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${btnBase} ${editor.isActive('bulletList') ? btnActive : ''}`}
          title="Bullet list"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${btnBase} ${editor.isActive('orderedList') ? btnActive : ''}`}
          title="Numbered list"
        >
          1. List
        </button>

        <span className="w-px h-5 bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`${btnBase} ${editor.isActive('blockquote') ? btnActive : ''}`}
          title="Quote"
        >
          ❝
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={btnBase}
          title="Horizontal rule"
        >
          ―
        </button>

        <span className="w-px h-5 bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={setLink}
          className={`${btnBase} ${editor.isActive('link') ? btnActive : ''}`}
          title="Link"
        >
          🔗
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetLink().run()}
          className={btnBase}
          title="Remove link"
        >
          ⛓️‍💥
        </button>

        {/* ---------- Image button ---------- */}
        <span className="w-px h-5 bg-slate-200 mx-1" />
        <button
          type="button"
          onClick={handleImageButton}
          className={btnBase}
          title="Insert image(s) from computer"
        >
          🖼️ Image
        </button>
        <button
          type="button"
          onClick={() => resizeSelectedImage(10)}
          className={btnBase}
          title="Enlarge selected image"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => resizeSelectedImage(-10)}
          className={btnBase}
          title="Shrink selected image"
        >
          −
        </button>

        <button
          type="button"
          onClick={handleReplaceImage}
          className={btnBase}
          title="Replace selected image"
          disabled={selectedImagePos === null}
        >
          Replace
        </button>
        <button
          type="button"
          onClick={handleDeleteImage}
          className={btnBase}
          title="Delete selected image"
          disabled={selectedImagePos === null}
        >
          Delete
        </button>

        <span className="w-px h-5 bg-slate-200 mx-1" />

        <div className="flex items-center gap-1">
          {['#0f172a', '#dc2626', '#0284c7', '#16a34a', '#ca8a04'].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-5 h-5 rounded border border-slate-200"
              style={{ backgroundColor: c }}
              title={`Text color ${c}`}
            />
          ))}
        </div>

        <span className="w-px h-5 bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          className={btnBase}
          title="Clear formatting"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className={btnBase}
          title="Undo"
        >
          ↶
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className={btnBase}
          title="Redo"
        >
          ↷
        </button>
      </div>

      {/* Editor area */}
      <div className="bg-white relative">
        <EditorContent editor={editor} />

        {/* Upload / Replace loading overlay */}
        {isUploading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[1px] cursor-wait">
            <div className="flex flex-col items-center gap-3 px-6 py-4 rounded-lg bg-white shadow-lg border border-slate-200">
              <div className="w-7 h-7 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold text-slate-700">
                {uploadMessage || 'Processing…'}
              </p>
              <p className="text-xs text-slate-500">
                Please wait, do not close this page.
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #94a3b8;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror { min-height: inherit; }
        .ProseMirror ul { list-style: disc; padding-left: 1.25rem; }
        .ProseMirror ol { list-style: decimal; padding-left: 1.25rem; }
        .ProseMirror blockquote {
          border-left: 3px solid #cbd5e1; padding-left: 0.75rem; color: #475569;
        }
        .ProseMirror hr { border-color: #e2e8f0; margin: 0.75rem 0; }
        .ProseMirror a { color: #0284c7; text-decoration: underline; }
        .ProseMirror img {
          width: calc(50% - 12px);
          max-width: calc(50% - 12px);
          display: inline-block;
          vertical-align: top;
          height: auto;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          margin: 8px 6px;
          box-sizing: border-box;
        }
        .ProseMirror img.ProseMirror-selectednode {
          outline: 2px solid #0284c7;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
