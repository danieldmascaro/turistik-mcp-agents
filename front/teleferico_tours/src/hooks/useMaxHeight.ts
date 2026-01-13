import { useOpenAiGlobal } from './useOpenAiGlobals';

export const useMaxHeight = (): number | null => {
  return useOpenAiGlobal("maxHeight");
};