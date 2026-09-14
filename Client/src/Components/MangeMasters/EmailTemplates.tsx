import React, { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { emailTemplateApi } from '../../services/masterApi';
import { type EmailTemplate } from '../../types/master';
import { MasterTable } from './MasterTable';
import { StatusBadge } from './StatusBadge';

type TemplateTypeOption = 'New booking' | 'Cancellation' | 'Ticket Change';

interface FormData {
  tamplate_name: string;
  Template_Type: TemplateTypeOption;
  email_sub: string;
  email_body: string;
  status: 'Enabled' | 'Disabled';
}

const initialFormData: FormData = {
  tamplate_name: '',
  Template_Type: 'New booking',
  email_sub: '',
  email_body: '',
  status: 'Enabled',
};

/* ============================================================
   Rich Text Editor
   ============================================================ */
interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
}

const RichEditor: React.FC<RichEditorProps> = ({ value, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  // Load initial content once on mount (and only when switching records)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value === '' ? '' : undefined]); // only reset when cleared externally

  const exec = (cmd: string, arg?: string) => {
    document.execCommand(cmd, false, arg);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
    editorRef.current?.focus();
  };

  const insertText = (text: string) => {
    exec('insertText', text);
  };

  const ToolBtn: React.FC<{ onClick: () => void; title: string; children: React.ReactNode }> = ({
    onClick,
    title,
    children,
  }) => (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="px-2 py-1 text-[12px] rounded border border-slate-200 bg-white text-slate-600
                 hover:bg-slate-100 transition min-w-[28px]"
    >
      {children}
    </button>
  );

  const Divider = () => <span className="w-px h-5 bg-slate-200 mx-1" />;

  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-sky-500">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200">
        <ToolBtn title="Undo" onClick={() => exec('undo')}>↶</ToolBtn>
        <ToolBtn title="Redo" onClick={() => exec('redo')}>↷</ToolBtn>
        <Divider />

        <ToolBtn title="Bold" onClick={() => exec('bold')}><b>B</b></ToolBtn>
        <ToolBtn title="Italic" onClick={() => exec('italic')}><i>I</i></ToolBtn>
        <ToolBtn title="Underline" onClick={() => exec('underline')}><u>U</u></ToolBtn>
        <ToolBtn title="Strike" onClick={() => exec('strikeThrough')}><s>S</s></ToolBtn>
        <Divider />

        <ToolBtn title="Align left" onClick={() => exec('justifyLeft')}>⯇</ToolBtn>
        <ToolBtn title="Align center" onClick={() => exec('justifyCenter')}>≡</ToolBtn>
        <ToolBtn title="Align right" onClick={() => exec('justifyRight')}>⯈</ToolBtn>
        <ToolBtn title="Justify" onClick={() => exec('justifyFull')}>☰</ToolBtn>
        <Divider />

        <ToolBtn title="Bullet list" onClick={() => exec('insertUnorderedList')}>• List</ToolBtn>
        <ToolBtn title="Numbered list" onClick={() => exec('insertOrderedList')}>1. List</ToolBtn>
        <Divider />

        <ToolBtn title="Insert link" onClick={() => {
          const url = window.prompt('Enter URL:');
          if (url) exec('createLink', url);
        }}>🔗</ToolBtn>
        <ToolBtn title="Remove link" onClick={() => exec('unlink')}>⛓️‍💥</ToolBtn>
        <ToolBtn title="Horizontal rule" onClick={() => exec('insertHorizontalRule')}>—</ToolBtn>

        <select
          onChange={(e) => exec('formatBlock', e.target.value)}
          className="px-2 py-1 text-[12px] rounded border border-slate-200 bg-white text-slate-600"
          defaultValue=""
        >
          <option value="" disabled>Format</option>
          <option value="P">Paragraph</option>
          <option value="H1">Heading 1</option>
          <option value="H2">Heading 2</option>
          <option value="H3">Heading 3</option>
          <option value="BLOCKQUOTE">Quote</option>
        </select>

        <select
          onChange={(e) => exec('fontName', e.target.value)}
          className="px-2 py-1 text-[12px] rounded border border-slate-200 bg-white text-slate-600"
          defaultValue=""
        >
          <option value="" disabled>Font</option>
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Courier New">Courier</option>
          <option value="Verdana">Verdana</option>
        </select>

        <select
          onChange={(e) => exec('fontSize', e.target.value)}
          className="px-2 py-1 text-[12px] rounded border border-slate-200 bg-white text-slate-600"
          defaultValue=""
        >
          <option value="" disabled>Size</option>
          <option value="1">Small</option>
          <option value="3">Normal</option>
          <option value="5">Large</option>
          <option value="7">Huge</option>
        </select>

        <Divider />

        {/* Quick-insert variables */}
        <span className="text-[11px] text-slate-500 mr-1">Insert:</span>
        <ToolBtn title="Insert [PNR]" onClick={() => insertText('[PNR]')}>PNR</ToolBtn>
        <ToolBtn title="Insert [PAX]" onClick={() => insertText('[PAX]')}>PAX</ToolBtn>
        <ToolBtn title="Insert [STATUS]" onClick={() => insertText('[STATUS]')}>STATUS</ToolBtn>
        <ToolBtn title="Insert [ITINERARY]" onClick={() => insertText('[ITINERARY]')}>ITINERARY</ToolBtn>
      </div>

      {/* Editable area — fixed height, scrolls inside */}
      <div className="h-[360px] overflow-hidden">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
          className="w-full h-full overflow-y-auto overflow-x-hidden p-4 text-sm text-slate-800
                     focus:outline-none break-words"
          style={{ lineHeight: 1.6, wordBreak: 'break-word', overflowWrap: 'anywhere' }}
        />
      </div>
    </div>
  );
};

/* ============================================================
   Main Component
   ============================================================ */
export const EmailTemplates: React.FC = () => {
  const [data, setData] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<EmailTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await emailTemplateApi.getAll();
      if (res.data.success) setData(res.data.data);
    } catch {
      toast.error('Failed to fetch email templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { setPage(1); }, [data.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = editingId
        ? await emailTemplateApi.update(editingId, formData)
        : await emailTemplateApi.create(formData);
      if (res.data.success) {
        toast.success(editingId ? 'Updated successfully' : 'Created successfully');
        resetForm();
        await fetchData();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (r: EmailTemplate) => {
    setEditingId(r._id);
    setFormData({
      tamplate_name: r.tamplate_name,
      Template_Type: r.Template_Type as TemplateTypeOption,
      email_sub: r.email_sub,
      email_body: r.email_body,
      status: r.status,
    });
    setShowForm(true);
  };

  // ===== Delete modal =====
  const openDeleteModal = (record: EmailTemplate) => setDeleteTarget(record);
  const closeDeleteModal = () => {
    if (isDeleting) return;
    setDeleteTarget(null);
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await emailTemplateApi.delete(deleteTarget._id);
      if (res.data.success) {
        toast.success('Deleted successfully');
        setDeleteTarget(null);
        await fetchData();
      }
    } catch {
      toast.error('Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (id: string, s: string) => {
    try {
      const res = await emailTemplateApi.toggleStatus(id, s);
      if (res.data.success) {
        toast.success('Status updated');
        await fetchData();
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(initialFormData);
  };

  // ===== Pagination computation =====
  const pageCount = Math.max(1, Math.ceil(data.length / perPage));
  const currentPage = Math.min(page, pageCount);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, data.length);
  const visibleData = useMemo(
    () => data.slice(startIndex, endIndex),
    [data, startIndex, endIndex]
  );
  const firstVisible = data.length ? startIndex + 1 : 0;
  const lastVisible = endIndex;

  const columns = [
    {
      key: 'tamplate_name',
      label: 'Template Name',
      render: (v: string) => <span className="font-medium text-slate-800">{v}</span>,
    },
    {
      key: 'Template_Type',
      label: 'Type',
      render: (v: string) => (
        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
          {v || '-'}
        </span>
      ),
    },
    {
      key: 'email_sub',
      label: 'Subject',
      render: (v: string) => <span className="text-slate-700">{v || '-'}</span>,
    },
    {
      key: 'add_by',
      label: 'Added By',
      render: (v: any) => {
        if (!v) return <span className="text-slate-400">-</span>;
        if (typeof v === 'object' && v !== null) {
          return <span className="text-slate-700">{v.user_name || v.name || v.email || '-'}</span>;
        }
        if (v === '0' || v === 0) return <span className="text-slate-700">Admin</span>;
        return <span className="text-slate-700">{String(v)}</span>;
      },
    },
    {
      key: 'add_date',
      label: 'Add Date',
      render: (v: string) => (v ? new Date(v).toLocaleDateString() : '-'),
    },
    {
      key: 'status',
      label: 'Status',
      render: (v: string, r: EmailTemplate) => (
        <StatusBadge
          status={v as 'Enabled' | 'Disabled'}
          onToggle={() => handleToggleStatus(r._id, v)}
          showToggle
        />
      ),
    },
  ];

  const actions = (r: EmailTemplate) => (
    <>
      <button
        onClick={() => handleEdit(r)}
        className="text-sky-600 hover:text-sky-800 transition"
        title="Edit"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <button
        onClick={() => openDeleteModal(r)}
        className="text-red-600 hover:text-red-800 transition"
        title="Delete"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Email Template</h1>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 transition"
        >
          {showForm ? '✕ Cancel' : '+ Add New'}
        </button>
      </div>

      {/* ===== Form ===== */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-5">
            {editingId ? 'Edit Email Template' : 'Add New Email Template'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Row 1: Email Subject | Template Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Subject *
                </label>
                <input
                  required
                  type="text"
                  value={formData.email_sub}
                  onChange={(e) => setFormData({ ...formData, email_sub: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Enter Email Subject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Template Name *
                </label>
                <input
                  required
                  type="text"
                  value={formData.tamplate_name}
                  onChange={(e) => setFormData({ ...formData, tamplate_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Enter Template Name"
                />
              </div>
            </div>

            {/* Row 2: Email Body (rich editor) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email Body *
              </label>
              <RichEditor
                value={formData.email_body}
                onChange={(html) => setFormData({ ...formData, email_body: html })}
              />
              <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs font-medium text-slate-600 mb-1">Available Variables:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1 text-xs text-slate-500">
                  <code>[AGENCY_ADDRESS]</code>
                  <code>[AGENCY_EMAIL]</code>
                  <code>[AGENCY_PHONE]</code>
                  <code>[PAX]</code>
                  <code>[PNR]</code>
                  <code>[STATUS]</code>
                  <code>[ITINERARY]</code>
                </div>
              </div>
            </div>

            {/* Row 3: Template Type | Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Template Type *
                </label>
                <select
                  required
                  value={formData.Template_Type}
                  onChange={(e) => setFormData({ ...formData, Template_Type: e.target.value as TemplateTypeOption })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="New booking">New booking</option>
                  <option value="Cancellation">Cancellation</option>
                  <option value="Ticket Change">Ticket Change</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="Enabled">Enabled</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : (editingId ? 'Update' : 'Submit')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <MasterTable
        columns={columns}
        data={visibleData}
        loading={loading}
        actions={actions}
        emptyMessage="No email templates found."
      />

      {/* ===== Pagination ===== */}
      {!loading && data.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 px-4 py-3 bg-white border border-slate-200 rounded-lg mt-4">
          <div className="text-[13px] text-slate-500">
            Showing <span className="font-medium text-slate-700">{firstVisible}</span> to{' '}
            <span className="font-medium text-slate-700">{lastVisible}</span> of{' '}
            <span className="font-medium text-slate-700">{data.length}</span> records
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-[13px] text-slate-500 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <button
                type="button"
                className="min-w-[34px] h-8 px-3 rounded-md bg-sky-500 text-white text-[13px] font-semibold"
              >
                {currentPage}
              </button>
              <button
                type="button"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === pageCount}
                className="px-3 py-1.5 text-[13px] text-slate-500 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[13px] text-slate-500">Rows:</span>
              <div className="relative">
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="appearance-none pl-3 pr-8 py-1.5 text-[13px] text-slate-700 bg-white
                             border border-slate-200 rounded-md hover:bg-slate-50 cursor-pointer
                             focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {[10, 25, 50, 100].map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                  ▾
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Delete Confirmation Modal ===== */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={closeDeleteModal}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Delete Email Template
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to delete{' '}
              <span className="font-medium text-slate-700">
                {deleteTarget.tamplate_name}
              </span>
              ?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="px-5 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium
                           hover:bg-slate-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold
                           hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};