import { useEffect, useMemo, useState } from "react";
import {
  extractNaceDivisionCode,
  findNaceSectionByDivisionCode,
  naceSections,
} from "../data/naceOptions";

interface NaceSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function NaceSelector({ value, onChange }: NaceSelectorProps) {
  const initialDivisionCode = extractNaceDivisionCode(value);
  const initialSectionCode = findNaceSectionByDivisionCode(initialDivisionCode)?.code ?? "";

  const [selectedSectionCode, setSelectedSectionCode] = useState(initialSectionCode);
  const [selectedDivisionCode, setSelectedDivisionCode] = useState(initialDivisionCode);

  useEffect(() => {
    const nextDivisionCode = extractNaceDivisionCode(value);
    const nextSectionCode = findNaceSectionByDivisionCode(nextDivisionCode)?.code ?? "";

    setSelectedSectionCode(nextSectionCode);
    setSelectedDivisionCode(nextDivisionCode);
  }, [value]);

  const selectedSection = useMemo(
    () => naceSections.find((section) => section.code === selectedSectionCode) ?? null,
    [selectedSectionCode],
  );

  const divisionOptions = selectedSection?.divisions ?? [];

  return (
    <div className="space-y-2">
      <select
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
        value={selectedSectionCode}
        onChange={(event) => {
          setSelectedSectionCode(event.target.value);
          setSelectedDivisionCode("");
          onChange("");
        }}
      >
        <option value="">Ana NACE grubu secin</option>
        {naceSections.map((section) => (
          <option key={section.code} value={section.code}>
            {section.code} - {section.name}
          </option>
        ))}
      </select>

      <select
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
        value={selectedDivisionCode}
        disabled={!selectedSection}
        onChange={(event) => {
          const nextDivisionCode = event.target.value;
          setSelectedDivisionCode(nextDivisionCode);

          const nextDivision = divisionOptions.find((division) => division.code === nextDivisionCode);
          onChange(nextDivision ? `${nextDivision.code} - ${nextDivision.name}` : "");
        }}
      >
        <option value="">{selectedSection ? "Alt faaliyet kodunu secin" : "Once ana grup secin"}</option>
        {divisionOptions.map((division) => (
          <option key={division.code} value={division.code}>
            {division.code} - {division.name}
          </option>
        ))}
      </select>
    </div>
  );
}
