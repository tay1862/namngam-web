'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo,
  Heading1, 
  Heading2, 
  Heading3, 
  Link as LinkIcon, 
  ImageIcon,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code,
  Strikethrough,
  Highlighter,
  Superscript,
  Subscript,
  MoreHorizontal
} from 'lucide-react';
import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import ImageUploader from './ImageUploader';

interface EnhancedRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
  enableTables?: boolean;
  enableMediaUpload?: boolean;
}

export default function EnhancedRichTextEditor({ 
  value, 
  onChange, 
  placeholder = 'Start typing...', 
  height = 400,
  enableTables = true,
  enableMediaUpload = true
}: EnhancedRichTextEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'editor-image',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3',
        placeholder: placeholder,
      },
    },
  });

  const addLink = useCallback(() => {
    if (linkUrl && editor) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setLinkText('');
      setShowLinkDialog(false);
    }
  }, [editor, linkUrl]);

  const addImage = useCallback(() => {
    if (imageUrl && editor) {
      editor.chain().focus().setImage({ src: imageUrl, alt: imageAlt }).run();
      setImageUrl('');
      setImageAlt('');
      setShowImageDialog(false);
    }
  }, [editor, imageUrl, imageAlt]);

  const addTable = useCallback(() => {
    if (editor) {
      // Table functionality disabled due to missing extensions
      setShowTableDialog(false);
    }
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to);
    setLinkText(text);
    const existingLink = editor.getAttributes('link').href;
    setLinkUrl(existingLink || '');
    setShowLinkDialog(true);
  }, [editor]);

  const insertMediaImage = useCallback((url: string, alt: string) => {
    if (!editor) return;
    editor.chain().focus().setImage({ src: url, alt }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  const MenuButton = ({ 
    icon: Icon, 
    onClick, 
    isActive = false, 
    title,
    disabled = false 
  }: {
    icon: any;
    onClick: () => void;
    isActive?: boolean;
    title: string;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded hover:bg-gray-200 transition-colors ${
        isActive ? 'bg-gray-300' : ''
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={title}
    >
      <Icon size={18} />
    </button>
  );

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
        {/* Text Formatting */}
        <MenuButton
          icon={Bold}
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        />
        <MenuButton
          icon={Italic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        />
        <MenuButton
          icon={Strikethrough}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        />
        <MenuButton
          icon={Code}
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Code"
        />

        <div className="w-px h-8 bg-gray-300 mx-1" />

        {/* Headings */}
        <MenuButton
          icon={Heading1}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        />
        <MenuButton
          icon={Heading2}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        />
        <MenuButton
          icon={Heading3}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        />

        <div className="w-px h-8 bg-gray-300 mx-1" />

        {/* Lists */}
        <MenuButton
          icon={List}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        />
        <MenuButton
          icon={ListOrdered}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        />
        <MenuButton
          icon={Quote}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Quote"
        />

        <div className="w-px h-8 bg-gray-300 mx-1" />

        {/* Alignment - Disabled due to missing extension */}
        {/* <MenuButton
          icon={AlignLeft}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        />
        <MenuButton
          icon={AlignCenter}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        />
        <MenuButton
          icon={AlignRight}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        /> */}

        <div className="w-px h-8 bg-gray-300 mx-1" />

        {/* Media */}
        <MenuButton
          icon={LinkIcon}
          onClick={setLink}
          isActive={editor.isActive('link')}
          title="Add Link"
        />
        {enableMediaUpload && (
          <MenuButton
            icon={ImageIcon}
            onClick={() => setShowImageDialog(true)}
            title="Add Image"
          />
        )}
        {/* Tables disabled due to missing extensions */}
        {/* {enableTables && (
          <MenuButton
            icon={TableIcon}
            onClick={() => setShowTableDialog(true)}
            title="Insert Table"
          />
        )} */}

        <div className="w-px h-8 bg-gray-300 mx-1" />

        {/* History */}
        <MenuButton
          icon={Undo}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        />
        <MenuButton
          icon={Redo}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        />

        {/* More Options */}
        <div className="relative">
          <MenuButton
            icon={MoreHorizontal}
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            isActive={showMoreOptions}
            title="More Options"
          />
          
          {showMoreOptions && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 min-w-[200px]">
              <MenuButton
                icon={Highlighter}
                onClick={() => {/* Highlight disabled due to missing extension */}}
                isActive={false}
                title="Highlight"
              />
              <MenuButton
                icon={Superscript}
                onClick={() => {/* Superscript disabled due to missing extension */}}
                isActive={false}
                title="Superscript"
              />
              <MenuButton
                icon={Subscript}
                onClick={() => {/* Subscript disabled due to missing extension */}}
                isActive={false}
                title="Subscript"
              />
            </div>
          )}
        </div>
      </div>

      {/* Editor */}
      <div style={{ height }}>
        <EditorContent editor={editor} />
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Add Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link Text</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Enter link text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => setShowLinkDialog(false)}
                variant="ghost"
              >
                Cancel
              </Button>
              <Button onClick={addLink}>
                Add Link
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add Image</h3>
            
            {enableMediaUpload ? (
              <div className="mb-4">
                <ImageUploader
                  folder="content"
                  onUploadComplete={(url) => setImageUrl(url)}
                />
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text</label>
                  <input
                    type="text"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Describe the image for accessibility"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text</label>
                  <input
                    type="text"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Describe the image for accessibility"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => {
                  setShowImageDialog(false);
                  setImageUrl('');
                  setImageAlt('');
                }}
                variant="ghost"
              >
                Cancel
              </Button>
              <Button onClick={addImage}>
                Add Image
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table Dialog - Disabled */}
      {false && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Insert Table</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rows</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={tableRows}
                    onChange={(e) => setTableRows(parseInt(e.target.value) || 3)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Columns</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={tableCols}
                    onChange={(e) => setTableCols(parseInt(e.target.value) || 3)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => setShowTableDialog(false)}
                variant="ghost"
              >
                Cancel
              </Button>
              <Button onClick={addTable}>
                Insert Table
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}