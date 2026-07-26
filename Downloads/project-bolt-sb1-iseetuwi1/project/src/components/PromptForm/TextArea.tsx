import React from 'react';

interface TextAreaProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  height: string;
}

export function TextArea({ id, label, value, onChange, placeholder, height }: TextAreaProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full ${height} p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
        placeholder={placeholder}
      />
    </div>
  );
}