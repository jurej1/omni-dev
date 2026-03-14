import { createContext, createMemo, createResource, createSignal, useContext } from "solid-js";
import type { ParentComponent } from "solid-js";
import { FileScanner } from "../utils/file-scanner";

type AutocompleteContextValue = {
  autocompleteVisible: () => boolean;
  setAutocompleteVisible: (v: boolean) => void;
  autocompleteIndex: () => number;
  setAutocompleteIndex: (v: number) => void;
  autocompleteQuery: () => string;
  setAutocompleteQuery: (v: string) => void;
  selectedIndex: () => number;
  setSelectedIndex: (v: number | ((prev: number) => number)) => void;
  mentionedFiles: () => string[];
  setMentionedFiles: (v: string[] | ((prev: string[]) => string[])) => void;
  filteredOptions: () => string[];
  allFiles: () => string[] | undefined;
};

const AutocompleteContext = createContext<AutocompleteContextValue>();

export const AutocompleteProvider: ParentComponent = (props) => {
  const [autocompleteVisible, setAutocompleteVisible] = createSignal(false);
  const [autocompleteIndex, setAutocompleteIndex] = createSignal(0);
  const [autocompleteQuery, setAutocompleteQuery] = createSignal("");
  const [selectedIndex, setSelectedIndex] = createSignal(0);
  const [mentionedFiles, setMentionedFiles] = createSignal<string[]>([]);

  const [allFiles] = createResource(() => FileScanner.scanFiles(process.cwd()));

  const filteredOptions = createMemo((): string[] => {
    const files = allFiles();
    if (!files || !autocompleteVisible()) return [];
    const q = autocompleteQuery().toLowerCase();
    if (!q) return files.slice(0, 10);
    return files.filter((f) => f.toLowerCase().includes(q)).slice(0, 10);
  });

  return (
    <AutocompleteContext.Provider
      value={{
        autocompleteVisible,
        setAutocompleteVisible,
        autocompleteIndex,
        setAutocompleteIndex,
        autocompleteQuery,
        setAutocompleteQuery,
        selectedIndex,
        setSelectedIndex,
        mentionedFiles,
        setMentionedFiles,
        filteredOptions,
        allFiles,
      }}
    >
      {props.children}
    </AutocompleteContext.Provider>
  );
};

export function useAutocomplete() {
  const ctx = useContext(AutocompleteContext);
  if (!ctx) throw new Error("useAutocomplete must be used inside AutocompleteProvider");
  return ctx;
}
