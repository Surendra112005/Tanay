import React, { useState, useEffect } from "react";
import { Database, Trash2, Edit2, Download, Search, RefreshCw, Save, X, Plus } from "lucide-react";
import { api } from "../utils/api";

const TABLES = ["users", "memories", "relationships", "profiles"];

export default function DatabaseViewer() {
  const [activeTable, setActiveTable] = useState("users");
  const [rows, setRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingRow, setEditingRow] = useState(null); // stores row object currently in edit mode
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    fetchTableData();
  }, [activeTable]);

  const fetchTableData = async () => {
    setLoading(true);
    setEditingRow(null);
    setFeedback("");
    try {
      const data = await api.getDbTable(activeTable);
      setRows(data);
    } catch (err) {
      console.error(err);
      setFeedback("Failed to query table details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently erase this record?")) return;
    try {
      await api.deleteDbRow(activeTable, id);
      setRows(rows.filter((r) => r.id !== id));
      setFeedback("Record deleted successfully.");
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleEditClick = (row) => {
    setEditingRow({ ...row });
  };

  const handleUpdateSave = async () => {
    if (!editingRow) return;
    try {
      await api.updateDbRow(activeTable, editingRow);
      setRows(rows.map((r) => (r.id === editingRow.id ? editingRow : r)));
      setEditingRow(null);
      setFeedback("Record updated successfully.");
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const handleInputChange = (field, val) => {
    setEditingRow({ ...editingRow, [field]: val });
  };

  // Get table header labels dynamically
  const getHeaders = () => {
    if (rows.length === 0) return [];
    return Object.keys(rows[0]);
  };

  // Filter rows based on query
  const filteredRows = rows.filter((row) => {
    const values = Object.values(row).join(" ").toLowerCase();
    return values.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="text-left space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-luxury-gold/15 pb-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono tracking-widest text-luxury-gold/50 uppercase font-bold">
            Data Warehouse
          </span>
          <h2 className="luxury-heading text-2xl text-gold-gradient font-bold mt-1">
            Database Engine Viewer
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={api.exportDbTableUrl(activeTable)}
            download
            className="px-4 py-2 rounded text-xs bg-gold-gradient text-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 font-bold cursor-pointer shadow-gold-glow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
          <button
            onClick={fetchTableData}
            className="px-3 py-2 rounded border border-neutral-700 hover:border-luxury-gold/50 text-neutral-400 hover:text-luxury-gold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
        {TABLES.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTable(t)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              activeTable === t
                ? "bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/25"
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Control panel: search & feedback */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="w-full sm:w-80 relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Filter ${activeTable}...`}
            className="w-full bg-neutral-900 border border-luxury-gold/10 focus:border-luxury-gold/40 rounded-lg pl-10 pr-4 py-2 text-xs text-neutral-200 focus:outline-none"
          />
        </div>
        {feedback && (
          <span className="text-xs font-semibold text-luxury-gold bg-luxury-gold/5 border border-luxury-gold/15 py-1.5 px-3 rounded">
            {feedback}
          </span>
        )}
      </div>

      {/* Main Database Table Container */}
      <div className="glassmorphism rounded-xl border border-luxury-gold/10 overflow-hidden shadow-inner">
        {loading ? (
          <div className="h-64 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-luxury-gold" />
            <span className="text-xs text-neutral-400">Querying database rows...</span>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center opacity-60">
            <Database className="w-10 h-10 text-luxury-gold mb-2" />
            <p className="text-xs text-neutral-400">No matching database records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-950 border-b border-luxury-gold/10 text-luxury-gold font-bold uppercase tracking-wider">
                <tr>
                  {getHeaders().map((h) => (
                    <th key={h} className="p-4">{h}</th>
                  ))}
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 bg-neutral-900/10">
                {filteredRows.map((row) => {
                  const isEditing = editingRow && editingRow.id === row.id;
                  return (
                    <tr 
                      key={row.id} 
                      className="hover:bg-neutral-850/40 transition-colors"
                    >
                      {getHeaders().map((h) => (
                        <td key={h} className="p-4 font-sans text-neutral-300">
                          {isEditing && h !== "id" && h !== "user_id" && h !== "created_at" && h !== "updated_at" ? (
                            <input
                              type={typeof row[h] === "number" ? "number" : "text"}
                              value={editingRow[h] ?? ""}
                              onChange={(e) => handleInputChange(h, e.target.value)}
                              className="bg-neutral-950 border border-luxury-gold/30 focus:border-luxury-gold rounded p-1 text-xs text-neutral-200 focus:outline-none"
                            />
                          ) : (
                            String(row[h] ?? "")
                          )}
                        </td>
                      ))}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={handleUpdateSave}
                                className="text-green-400 hover:text-green-300 p-1.5 rounded bg-green-500/10 border border-green-500/20 cursor-pointer"
                                title="Save Row"
                              >
                                <Save className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingRow(null)}
                                className="text-neutral-400 hover:text-neutral-300 p-1.5 rounded bg-neutral-800 border border-neutral-700 cursor-pointer"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditClick(row)}
                                className="text-luxury-gold hover:text-luxury-goldHover p-1.5 rounded hover:bg-neutral-850 cursor-pointer"
                                title="Edit Row"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(row.id)}
                                className="text-red-500 hover:text-red-400 p-1.5 rounded hover:bg-neutral-850 cursor-pointer"
                                title="Delete Row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
