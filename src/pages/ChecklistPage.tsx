import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useChecklistProgress } from "@/hooks/useChecklistProgress";
import { useChecklistNotes } from "@/hooks/useChecklistNotes";
import { checklistSections, getAllItems, type ChecklistItem } from "@/data/checklistData";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, BookOpen, FileText, MapPin, TrendingUp, Shield, StickyNote, ChevronDown, ChevronUp, ClipboardList, Info, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const sectionIcons: Record<string, React.ElementType> = {
  Calendar, FileText, BookOpen, MapPin, TrendingUp, Shield, ClipboardList,
};

const badgeColors: Record<string, string> = {
  destructive: "bg-primary text-primary-foreground",
  warning: "bg-warning text-warning-foreground",
  accent: "bg-accent text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground",
};

const tagStyles: Record<string, string> = {
  obrig: "bg-primary/10 text-primary border-primary/20",
  enare: "bg-accent/10 text-accent border-accent/20",
  novo2026: "bg-success/10 text-success border-success/20",
  alerta: "bg-warning/10 text-warning border-warning/20",
  aceita: "bg-success/10 text-success border-success/20",
};

const tagLabels: Record<string, string> = {
  obrig: "OBRIG.",
  enare: "ENARE",
  novo2026: "NOVO 2026",
  alerta: "ALERTA",
  aceita: "ACEITA!",
};

const profileFilters = [
  { value: "all", label: "Todos" },
  { value: "concluinte", label: "🎓 Concluinte 6º Ano" },
  { value: "medico", label: "🩺 Médico Formado" },
  { value: "4ano", label: "📚 4º Ano" },
];

const alertStyles = {
  blue: "bg-accent/10 border-accent/30 text-accent",
  yellow: "bg-warning/10 border-warning/30 text-warning",
  green: "bg-success/10 border-success/30 text-success",
};

const alertIcons = {
  blue: Info,
  yellow: AlertTriangle,
  green: Info,
};

export default function ChecklistPage() {
  const { profile } = useAuth();
  const { isChecked, toggleItem, checkedCount } = useChecklistProgress();
  const { getNote, saveNote } = useChecklistNotes();
  const [searchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState(profile?.perfil ?? "all");
  const [openNotes, setOpenNotes] = useState<Record<string, boolean>>({});
  const [noteTexts, setNoteTexts] = useState<Record<string, string>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const allItems = getAllItems();
  const totalItems = allItems.length;
  const progressPercent = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  useEffect(() => {
    const sectionParam = searchParams.get("section");
    if (sectionParam) {
      setExpandedSections((prev) => ({ ...prev, [sectionParam]: true }));
    }
  }, [searchParams]);

  useEffect(() => {
    const initial: Record<string, boolean> = {};
    checklistSections.forEach((s) => { initial[s.id] = true; });
    setExpandedSections(initial);
  }, []);

  const toggleNote = (sectionId: string) => {
    if (!openNotes[sectionId] && !noteTexts[sectionId]) {
      setNoteTexts((prev) => ({ ...prev, [sectionId]: getNote(sectionId) }));
    }
    setOpenNotes((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const handleNoteChange = useCallback((sectionId: string, value: string) => {
    setNoteTexts((prev) => ({ ...prev, [sectionId]: value }));
  }, []);

  const handleNoteSave = (sectionId: string) => {
    saveNote.mutate({ sectionId, content: noteTexts[sectionId] ?? "" });
    toast.success("Anotação salva!");
  };

  const handleToggleItem = (itemId: string) => {
    const newChecked = !isChecked(itemId);
    toggleItem.mutate({ itemId, checked: newChecked });

    if (newChecked) {
      for (const section of checklistSections) {
        const sectionItems = section.subsections.flatMap((sub) => sub.items);
        const allChecked = sectionItems.every((item) =>
          item.id === itemId ? true : isChecked(item.id)
        );
        if (allChecked && sectionItems.some((item) => item.id === itemId)) {
          toast.success(`🎉 Seção "${section.title}" completa!`);
        }
      }
    }
  };

  const itemMatchesFilter = (item: ChecklistItem) => {
    if (activeFilter === "all") return true;
    if (!item.profiles || item.profiles.length === 0) return true;
    return item.profiles.includes(activeFilter);
  };

  const renderAlert = (alert: { type: "blue" | "yellow" | "green"; text: string }) => {
    const AlertIcon = alertIcons[alert.type];
    return (
      <div className={`flex items-start gap-2 p-3 rounded-lg border text-sm ${alertStyles[alert.type]}`}>
        <AlertIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <span>{alert.text}</span>
      </div>
    );
  };

  const renderItem = (item: ChecklistItem) => {
    const matches = itemMatchesFilter(item);
    const checked = isChecked(item.id);
    return (
      <div
        key={item.id}
        className={`flex flex-col gap-1 p-3 rounded-lg transition-all ${
          !matches ? "opacity-40" : ""
        } ${matches && !checked ? "hover:bg-secondary/30" : ""} ${
          checked ? "bg-success/5" : ""
        } ${matches && item.profiles && item.profiles.length > 0 ? "border-l-2 border-primary/40" : ""}`}
      >
        <div className="flex items-start gap-3">
          <Checkbox
            checked={checked}
            onCheckedChange={() => handleToggleItem(item.id)}
            className={`mt-0.5 ${checked ? "animate-check-bounce" : ""}`}
          />
          <div className="flex-1 min-w-0">
            <span className={`text-sm ${checked ? "line-through text-muted-foreground" : ""}`}>
              {item.emoji ? `${item.emoji} ` : ""}{item.text}
            </span>
            {item.detail && (
              <p className="text-xs text-muted-foreground mt-1 pl-0">{item.detail}</p>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 flex-wrap justify-end">
            {item.tags?.map((tag) => (
              <span key={tag} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${tagStyles[tag] ?? ""}`}>
                {tagLabels[tag] ?? tag}
              </span>
            ))}
            {item.profiles && item.profiles.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {item.profiles.map((p) => p === "concluinte" ? "🎓" : p === "medico" ? "🩺" : "📚").join("")}
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Meu Checklist</h1>
        <p className="text-muted-foreground">Acompanhe todos os passos para o ENAMED 2026</p>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {profileFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="font-medium">{checkedCount} de {totalItems} itens</span>
          <span className="font-medium">{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="h-3" />
      </div>

      {/* Sections */}
      {checklistSections.map((section) => {
        const Icon = sectionIcons[section.icon] || Calendar;
        const sectionItems = section.subsections.flatMap((sub) => sub.items);
        const sectionChecked = sectionItems.filter((item) => isChecked(item.id)).length;
        const sectionTotal = sectionItems.length;
        const sectionPct = sectionTotal > 0 ? Math.round((sectionChecked / sectionTotal) * 100) : 0;
        const expanded = expandedSections[section.id] !== false;

        return (
          <Card key={section.id} className="border-0 shadow-sm overflow-hidden">
            <CardHeader
              className="cursor-pointer hover:bg-secondary/30 transition-colors"
              onClick={() => setExpandedSections((prev) => ({ ...prev, [section.id]: !expanded }))}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base">{section.title}</CardTitle>
                      <Badge className={`text-xs ${badgeColors[section.badgeColor] ?? ""}`}>
                        {section.badge}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={sectionPct} className="h-1.5 w-24" />
                      <span className={`text-xs ${sectionPct === 100 ? "text-success font-semibold" : "text-muted-foreground"}`}>
                        {sectionPct === 100 ? "✓ " : ""}{sectionChecked}/{sectionTotal}
                      </span>
                    </div>
                  </div>
                </div>
                {expanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
              </div>
            </CardHeader>

            {expanded && (
              <CardContent className="pt-0 space-y-4">
                {/* Section-level alert */}
                {section.alert && renderAlert(section.alert)}

                {section.subsections.map((subsection, subIdx) => (
                  <div key={subIdx} className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground/80 pt-2 border-b border-border/50 pb-1">
                      {subsection.title}
                    </h3>
                    {subsection.alert && renderAlert(subsection.alert)}
                    <div className="space-y-1">
                      {subsection.items.map(renderItem)}
                    </div>
                  </div>
                ))}

                {/* Notes */}
                {section.hasNotes && (
                  <div className="pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); toggleNote(section.id); }}
                      className="text-muted-foreground"
                    >
                      <StickyNote className="h-4 w-4 mr-1" />
                      📝 Anotações
                    </Button>
                    {openNotes[section.id] && (
                      <div className="mt-2 space-y-2">
                        <Textarea
                          value={noteTexts[section.id] ?? ""}
                          onChange={(e) => handleNoteChange(section.id, e.target.value)}
                          placeholder={section.notesPlaceholder ?? "Suas anotações para esta seção..."}
                          className="min-h-[80px]"
                        />
                        <Button size="sm" onClick={() => handleNoteSave(section.id)}>
                          Salvar nota
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
