"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUp, Users } from "lucide-react";
import { Model } from "@/types";
import { fetchModelsClient } from "@/lib/fetch-models";
import Image from "next/image";

interface MentionInputProps {
  onSend: (message: string, mentions: MentionData[]) => void;
  disabled?: boolean;
  chatModelIds?: string[];
}

export interface MentionData {
  type: "everyone" | "model";
  modelId?: string;
  displayName: string;
}

interface Mention {
  id: string;
  type: "everyone" | "model";
  modelId?: string;
  displayName: string;
  startIndex: number;
  endIndex: number;
}

export function MentionInput({ onSend, disabled, chatModelIds = [] }: MentionInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [allModels, setAllModels] = useState<Model[]>([]);
  const [atTriggerIndex, setAtTriggerIndex] = useState<number | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch models
  useEffect(() => {
    fetchModelsClient().then(setAllModels).catch(console.error);
  }, []);

  // Filter models based on chat's selected models
  const availableModels = chatModelIds.length > 0
    ? allModels.filter(m => chatModelIds.includes(m.id))
    : allModels;

  // Filter dropdown options based on search
  const getFilteredOptions = useCallback(() => {
    const query = searchQuery.toLowerCase();
    const options: Array<{ type: "everyone" | "model"; model?: Model; displayName: string }> = [];

    // Add @everyone option
    if ("everyone".includes(query) || query === "") {
      options.push({ type: "everyone", displayName: "everyone" });
    }

    // Add model options
    availableModels.forEach(model => {
      if (
        model.displayName.toLowerCase().includes(query) ||
        model.name.toLowerCase().includes(query) ||
        model.id.toLowerCase().includes(query)
      ) {
        options.push({ type: "model", model, displayName: model.displayName });
      }
    });

    return options;
  }, [searchQuery, availableModels]);

  const filteredOptions = getFilteredOptions();

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart || 0;

    setInputValue(value);

    // Check if user just typed @
    const textBeforeCursor = value.slice(0, cursorPos);
    const atMatch = textBeforeCursor.match(/@([a-zA-Z0-9-_]*)$/);

    if (atMatch) {
      setAtTriggerIndex(cursorPos - atMatch[0].length);
      setSearchQuery(atMatch[1] || "");
      setShowDropdown(true);
      setSelectedIndex(0);

      // Position dropdown
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.top - 8,
          left: rect.left,
        });
      }
    } else {
      setShowDropdown(false);
      setAtTriggerIndex(null);
      setSearchQuery("");
    }
  };

  // Select a mention from dropdown
  const selectMention = (option: { type: "everyone" | "model"; model?: Model; displayName: string }) => {
    if (atTriggerIndex === null) return;

    const mentionText = `@${option.displayName}`;
    const beforeAt = inputValue.slice(0, atTriggerIndex);
    const afterQuery = inputValue.slice(atTriggerIndex + 1 + searchQuery.length);

    // Add space after mention if there isn't one
    const newValue = beforeAt + mentionText + (afterQuery.startsWith(" ") ? "" : " ") + afterQuery;

    const newMention: Mention = {
      id: `${Date.now()}`,
      type: option.type,
      modelId: option.model?.id,
      displayName: option.displayName,
      startIndex: atTriggerIndex,
      endIndex: atTriggerIndex + mentionText.length,
    };

    setInputValue(newValue);
    setMentions(prev => [...prev, newMention]);
    setShowDropdown(false);
    setAtTriggerIndex(null);
    setSearchQuery("");

    // Focus back to input
    setTimeout(() => {
      if (inputRef.current) {
        const newCursorPos = atTriggerIndex + mentionText.length + 1;
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showDropdown) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredOptions.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        if (filteredOptions[selectedIndex]) {
          selectMention(filteredOptions[selectedIndex]);
        }
      } else if (e.key === "Escape") {
        setShowDropdown(false);
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Extract mentions from text for sending
  const extractMentionsFromText = (text: string): MentionData[] => {
    const mentionRegex = /@(everyone|[\w\s.-]+?)(?=\s|$)/g;
    const foundMentions: MentionData[] = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      const mentionName = match[1];

      if (mentionName === "everyone") {
        foundMentions.push({ type: "everyone", displayName: "everyone" });
      } else {
        // Find matching model
        const model = availableModels.find(
          m => m.displayName.toLowerCase() === mentionName.toLowerCase() ||
               m.name.toLowerCase() === mentionName.toLowerCase()
        );
        if (model) {
          foundMentions.push({ type: "model", modelId: model.id, displayName: model.displayName });
        }
      }
    }

    return foundMentions;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled) {
      const extractedMentions = extractMentionsFromText(inputValue);
      onSend(inputValue.trim(), extractedMentions);
      setInputValue("");
      setMentions([]);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="w-full relative">
      <div className="flex items-end gap-3 p-4 border rounded-2xl bg-background shadow-sm hover:shadow-md transition-shadow">
        {/* Plus button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="flex-shrink-0 h-10 w-10"
          disabled
        >
          <Plus className="h-6 w-6" />
        </Button>

        {/* Input textarea */}
        <textarea
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Type @ to mention a model..."
          className="flex-1 min-h-[60px] max-h-[200px] resize-none border-0 shadow-none focus-visible:ring-0 focus:outline-none p-3 text-base bg-transparent placeholder:text-muted-foreground"
          rows={1}
        />

        {/* Send button */}
        <Button
          type="submit"
          disabled={!inputValue.trim() || disabled}
          size="icon"
          className="flex-shrink-0 h-10 w-10 rounded-full"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      </div>

      {/* Mention dropdown */}
      {showDropdown && filteredOptions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute bottom-full left-0 right-0 mb-2 mx-4 bg-[#2b2d31] border border-[#3f4147] rounded-lg shadow-lg overflow-hidden z-50"
        >
          <div className="p-2 text-xs text-muted-foreground border-b border-[#3f4147] uppercase tracking-wide">
            Models
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {filteredOptions.map((option, index) => (
              <button
                key={option.type === "everyone" ? "everyone" : option.model?.id}
                type="button"
                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                  index === selectedIndex
                    ? "bg-[#5865F2]/20"
                    : "hover:bg-[#35373c]"
                }`}
                onClick={() => selectMention(option)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {option.type === "everyone" ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">@everyone</div>
                      <div className="text-xs text-muted-foreground">
                        Send to all selected models
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={option.model!.logo}
                        alt={option.model!.displayName}
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">
                        @{option.model!.displayName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {option.model!.provider}
                      </div>
                    </div>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
