interface CodeDisplayProps {
  code: string;
}

export function CodeDisplay({ code }: CodeDisplayProps) {
  return (
    <div className="flex-1 p-6 bg-gray-950 overflow-auto">
      <pre className="bg-gray-800 p-6 rounded-lg shadow">
        <code className="text-sm">{code}</code>
      </pre>
    </div>
  );
}