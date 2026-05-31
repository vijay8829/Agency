"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Bot, Mail, Globe, Calendar, Plus, Copy, RefreshCw, Check, Megaphone, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { contentItems } from "@/lib/data";
import { SHELL, PAGE_TITLE, PAGE_SUB, SECTION_LABEL, INPUT_STYLE, INPUT_FOCUS, clr } from "@/lib/ds";

const CONTENT_TYPES = [
  { icon: Megaphone, label: "Social Posts",     color: "#f472b6", bg: "rgba(244,114,182,0.1)" },
  { icon: Mail,      label: "Email Campaigns",  color: clr.info,  bg: "rgba(96,165,250,0.1)"  },
  { icon: Globe,     label: "Web Copy",         color: "#2dd4bf", bg: "rgba(45,212,191,0.1)"  },
  { icon: Calendar,  label: "Content Calendar", color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
];

const OUTPUTS: Record<string, string> = {
  "Social Posts": `5 LinkedIn posts generated:\n\n1. "Behind every successful campaign is a team that treats your brand like their own. That's our promise. 🚀"\n\n2. "We helped @ApexDigital increase engagement by 340% in 90 days. Here's the strategy we used..."\n\n3. "Stop guessing what your audience wants. Start listening. Here are 3 data-driven content frameworks we swear by."\n\n4. "Client spotlight: @NovCommerce went from 0 to 50k monthly visitors in 6 months. Ask us how. 📈"\n\n5. "What separates good agencies from great ones? It's not talent. It's systems."`,
  "Email Campaigns": `Subject: "October Digest: Agency Growth Insights"\nPreview: This month, we share the 3 frameworks that doubled our clients' results...\n\nHi [First Name],\n\nOctober was a record month for our clients. Here's what's working:\n\n✅ Short-form video ads outperforming static by 4x\n✅ Personalised email sequences converting at 28%\n✅ Retargeting windows extending to 30 days\n\n[CTA: Book a Strategy Call]`,
  "Web Copy": `Hero:\n"Stop Losing Business to Agencies That Don't Understand Yours"\n\nSubhead: We become your marketing team — without the overhead. Strategies built around your goals.\n\nCTA: "Get Your Free Strategy Session"\n\nValue Props:\n• Results in 30 days, not 6 months\n• Dedicated account manager, always accessible\n• Transparent reporting, no black boxes`,
  "Content Calendar": `Q4 Content Plan:\n\nWeek 1: Brand story + origin post\nWeek 2: Client case study (Apex Digital)\nWeek 3: Educational: "5 metrics every agency should track"\nWeek 4: Behind-the-scenes team content\nWeek 5: Testimonial carousel\nWeek 6: Holiday campaign launch\nWeek 7: Year-in-review teaser\nWeek 8: Year-end offer post`,
};

const STATUS_COLOR: Record<string, { color: string; bg: string; label: string }> = {
  ready:  { color: clr.success, bg: "rgba(52,211,153,0.1)",  label: "Ready"  },
  draft:  { color: clr.text3,   bg: "rgba(113,113,122,0.1)", label: "Draft"  },
  review: { color: clr.warning, bg: "rgba(251,191,36,0.1)",  label: "Review" },
};

const STATUS_OPTIONS = ["draft", "review", "ready"];
const CONTENT_TYPE_OPTIONS = ["Social Media", "Email", "Web Copy", "Blog", "Video Script", "Planning"];

interface ContentItem {
  id: string;
  title: string;
  client: string;
  type: string;
  status: string;
}

const EMPTY_FORM = { title: "", client: "", type: "Social Media", status: "draft" };

export function Content() {
  const [contentList, setContentList] = useState<ContentItem[]>([...contentItems]);
  const [generatedContent, setGenerated] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);
  const [prompt, setPrompt]     = useState("");
  const [copied, setCopied]     = useState(false);

  const [showAdd, setShowAdd]   = useState(false);
  const [addForm, setAddForm]   = useState(EMPTY_FORM);
  const [addError, setAddError] = useState("");

  const [editItem, setEditItem] = useState<ContentItem | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editError, setEditError] = useState("");

  const generate = async (type: string) => {
    setLoading(true);
    setActiveType(type);
    setGenerated(null);
    await new Promise(r => setTimeout(r, 1400));
    setGenerated(OUTPUTS[type] || `Generated content for: ${type}`);
    setLoading(false);
  };

  const copyContent = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAdd = () => {
    if (!addForm.title.trim()) { setAddError("Title is required"); return; }
    if (!addForm.client.trim()) { setAddError("Client is required"); return; }
    const item: ContentItem = {
      id: String(Date.now()),
      title: addForm.title.trim(),
      client: addForm.client.trim(),
      type: addForm.type,
      status: addForm.status,
    };
    setContentList(prev => [item, ...prev]);
    setAddForm(EMPTY_FORM);
    setAddError("");
    setShowAdd(false);
  };

  const openEdit = (item: ContentItem) => {
    setEditItem(item);
    setEditForm({ title: item.title, client: item.client, type: item.type, status: item.status });
    setEditError("");
  };

  const handleEdit = () => {
    if (!editForm.title.trim()) { setEditError("Title is required"); return; }
    if (!editForm.client.trim()) { setEditError("Client is required"); return; }
    setContentList(prev => prev.map(c => c.id === editItem!.id ? { ...c, ...editForm, title: editForm.title.trim(), client: editForm.client.trim() } : c));
    setEditItem(null);
  };

  return (
    <div style={SHELL}>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 style={PAGE_TITLE}>Content Employee</h2>
          <p style={PAGE_SUB}>AI-powered content creation, scheduling, and distribution</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus style={{ width: 13, height: 13 }} />}
          onClick={() => { setShowAdd(true); setAddError(""); }}>
          New Content
        </Button>
      </div>

      {/* Content type buttons */}
      <div className="grid grid-cols-2 gap-3 mb-8 sm:grid-cols-4">
        {CONTENT_TYPES.map(type => {
          const Icon = type.icon;
          return (
            <button
              key={type.label}
              onClick={() => generate(type.label)}
              style={{ padding: "16px", borderRadius: 12, border: `1px solid ${activeType === type.label ? type.color + "40" : clr.border}`, background: activeType === type.label ? type.bg : clr.card, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
              onMouseEnter={e => { if (activeType !== type.label) { (e.currentTarget as HTMLButtonElement).style.borderColor = type.color + "30"; (e.currentTarget as HTMLButtonElement).style.background = clr.cardHover; }}}
              onMouseLeave={e => { if (activeType !== type.label) { (e.currentTarget as HTMLButtonElement).style.borderColor = clr.border; (e.currentTarget as HTMLButtonElement).style.background = clr.card; }}}
            >
              <div style={{ width: 32, height: 32, borderRadius: 9, background: type.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                <Icon style={{ width: 15, height: 15, color: type.color }} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: clr.text1 }}>{type.label}</div>
              <div style={{ fontSize: 11, color: clr.text4, marginTop: 2 }}>Generate with AI</div>
            </button>
          );
        })}
      </div>

      {/* AI prompt area */}
      <div style={{ background: "rgba(124,58,237,0.045)", border: "1px solid rgba(124,58,237,0.16)", borderRadius: 14, padding: "20px", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles style={{ width: 14, height: 14, color: "white" }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: clr.text1 }}>AI Content Employee</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") generate(prompt || "Social Posts"); }}
            placeholder="Describe the content you need, or click a type above..."
            style={{ flex: 1, background: "var(--clr-input-bg)", border: `1px solid var(--clr-input-border)`, borderRadius: 10, padding: "10px 14px", fontSize: 13, color: clr.text1, outline: "none", transition: "border-color 0.15s" }}
            onFocus={e => { (e.target as HTMLInputElement).style.borderColor = "rgba(124,58,237,0.4)"; }}
            onBlur={e => { (e.target as HTMLInputElement).style.borderColor = clr.border; }}
          />
          <Button variant="primary" loading={loading} onClick={() => generate(prompt || "Social Posts")} icon={<Sparkles style={{ width: 13, height: 13 }} />}>
            Generate
          </Button>
        </div>

        <AnimatePresence>
          {(loading || generatedContent) && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div style={{ marginTop: 14, background: "rgba(0,0,0,0.25)", border: `1px solid ${clr.border}`, borderRadius: 12, padding: "16px 18px" }}>
                {loading ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 10, color: clr.text3, fontSize: 13 }}>
                    <div style={{ width: 14, height: 14, border: "1.5px solid rgba(124,58,237,0.3)", borderTopColor: clr.accent, borderRadius: "50%" }} className="spin" />
                    AI generating {activeType?.toLowerCase()}…
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <Bot style={{ width: 13, height: 13, color: "#a78bfa" }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#a78bfa" }}>{activeType} — AI Generated</span>
                      <Badge variant="purple" className="ml-auto">Ready</Badge>
                    </div>
                    <pre style={{ fontSize: 12, color: clr.text2, whiteSpace: "pre-wrap", fontFamily: "'SF Mono', 'Monaco', 'Cascadia Code', monospace", lineHeight: 1.7, margin: 0 }}>
                      {generatedContent}
                    </pre>
                    <div style={{ display: "flex", gap: 8, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${clr.border}` }}>
                      <Button variant="primary" size="sm" onClick={() => {
                        if (!generatedContent || !activeType) return;
                        const newItem: ContentItem = {
                          id: String(Date.now()),
                          title: `${activeType} — ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}`,
                          client: "General",
                          type: activeType.includes("Social") ? "Social Media" : activeType.includes("Email") ? "Email" : activeType.includes("Web") ? "Web Copy" : "Planning",
                          status: "ready",
                        };
                        setContentList(prev => [newItem, ...prev]);
                        copyContent();
                      }}>Use This</Button>
                      <Button variant="secondary" size="sm" icon={<RefreshCw style={{ width: 12, height: 12 }} />} onClick={() => generate(activeType || "Social Posts")}>Regenerate</Button>
                      <Button variant="ghost" size="sm" icon={copied ? <Check style={{ width: 12, height: 12 }} /> : <Copy style={{ width: 12, height: 12 }} />} onClick={copyContent}>
                        {copied ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content library */}
      <div style={SECTION_LABEL}>Content Library — {contentList.length}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {contentList.map((item, i) => {
          const st = STATUS_COLOR[item.status] || STATUS_COLOR.draft;
          return (
            <motion.div key={item.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
              <div style={{ background: clr.card, border: `1px solid ${clr.border}`, borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, transition: "background 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = clr.cardHover; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = clr.card; }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: clr.text1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: clr.text3, marginTop: 2 }}>{item.client} · {item.type}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: st.color, background: st.bg, borderRadius: 6, padding: "2px 8px", flexShrink: 0 }}>
                  {st.label}
                </span>
                <Button variant="ghost" size="sm" icon={<Edit2 style={{ width: 12, height: 12 }} />} onClick={() => openEdit(item)}>Edit</Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* New Content Modal */}
      {showAdd && (
        <Modal title="New Content" onClose={() => { setShowAdd(false); setAddForm(EMPTY_FORM); setAddError(""); }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: clr.text3, marginBottom: 6, letterSpacing: "0.04em" }}>TITLE *</label>
              <input
                style={INPUT_STYLE} {...INPUT_FOCUS}
                placeholder="Q4 Social Campaign"
                maxLength={80}
                value={addForm.title}
                onChange={e => setAddForm(p => ({ ...p, title: e.target.value }))}
                onKeyDown={e => { if (e.key === "Enter") handleAdd(); }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: clr.text3, marginBottom: 6, letterSpacing: "0.04em" }}>CLIENT *</label>
              <input
                style={INPUT_STYLE} {...INPUT_FOCUS}
                placeholder="Nova Commerce"
                maxLength={60}
                value={addForm.client}
                onChange={e => setAddForm(p => ({ ...p, client: e.target.value }))}
                onKeyDown={e => { if (e.key === "Enter") handleAdd(); }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: clr.text3, marginBottom: 6, letterSpacing: "0.04em" }}>TYPE</label>
                <select style={{ ...INPUT_STYLE, cursor: "pointer" }} value={addForm.type} onChange={e => setAddForm(p => ({ ...p, type: e.target.value }))}>
                  {CONTENT_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: clr.text3, marginBottom: 6, letterSpacing: "0.04em" }}>STATUS</label>
                <select style={{ ...INPUT_STYLE, cursor: "pointer" }} value={addForm.status} onChange={e => setAddForm(p => ({ ...p, status: e.target.value }))}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>
            {addError && <p style={{ fontSize: 12, color: clr.danger }}>{addError}</p>}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
              <Button variant="ghost" onClick={() => { setShowAdd(false); setAddForm(EMPTY_FORM); setAddError(""); }}>Cancel</Button>
              <Button variant="primary" icon={<Plus style={{ width: 13, height: 13 }} />} onClick={handleAdd}>Add Content</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Content Modal */}
      {editItem && (
        <Modal title="Edit Content" onClose={() => setEditItem(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: clr.text3, marginBottom: 6, letterSpacing: "0.04em" }}>TITLE *</label>
              <input
                style={INPUT_STYLE} {...INPUT_FOCUS}
                maxLength={80}
                value={editForm.title}
                onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))}
                onKeyDown={e => { if (e.key === "Enter") handleEdit(); }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: clr.text3, marginBottom: 6, letterSpacing: "0.04em" }}>CLIENT *</label>
              <input
                style={INPUT_STYLE} {...INPUT_FOCUS}
                maxLength={60}
                value={editForm.client}
                onChange={e => setEditForm(p => ({ ...p, client: e.target.value }))}
                onKeyDown={e => { if (e.key === "Enter") handleEdit(); }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: clr.text3, marginBottom: 6, letterSpacing: "0.04em" }}>TYPE</label>
                <select style={{ ...INPUT_STYLE, cursor: "pointer" }} value={editForm.type} onChange={e => setEditForm(p => ({ ...p, type: e.target.value }))}>
                  {CONTENT_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: clr.text3, marginBottom: 6, letterSpacing: "0.04em" }}>STATUS</label>
                <select style={{ ...INPUT_STYLE, cursor: "pointer" }} value={editForm.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>
            {editError && <p style={{ fontSize: 12, color: clr.danger }}>{editError}</p>}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
              <Button variant="ghost" onClick={() => setEditItem(null)}>Cancel</Button>
              <Button variant="primary" icon={<Check style={{ width: 13, height: 13 }} />} onClick={handleEdit}>Save Changes</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
