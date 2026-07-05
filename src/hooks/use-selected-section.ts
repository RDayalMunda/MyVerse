import { useEffect, useMemo, useState } from 'react';

import type { Section } from '@/types/project';

function sortSections(sections: Section[]): Section[] {
  return [...sections].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function useSelectedSection(sections: Section[] | undefined) {
  const sorted = useMemo(
    () => (sections ? sortSections(sections) : []),
    [sections],
  );

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (sorted.length === 0) {
      setSelectedSectionId(null);
      return;
    }

    setSelectedSectionId((current) => {
      if (current && sorted.some((section) => section.id === current)) {
        return current;
      }
      return sorted[0].id;
    });
  }, [sorted]);

  const selectedSection =
    sorted.find((section) => section.id === selectedSectionId) ?? null;

  return {
    sections: sorted,
    selectedSection,
    selectedSectionId,
    setSelectedSectionId,
  };
}
