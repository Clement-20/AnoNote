import { useState } from "react";

interface ToggleSwitchProps {
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
}

export function ToggleSwitch({ defaultChecked = false, onChange }: ToggleSwitchProps) {
  const [checked, setChecked] = useState(defaultChecked);

  const handleToggle = () => {
    const newValue = !checked;
    setChecked(newValue);
    onChange?.(newValue);
  };

  return (
    <button
      onClick={handleToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-purple-600" : "bg-gray-600"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
