import { cn } from '@/lib/utils';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export function TextArea({ label, className, id, ...props }: TextAreaProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium dark:text-gray-200 mb-2">
        {label}
      </label>
      <textarea
        {...props}
        id={id}
        className={cn(
          'w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100',
          'placeholder:dark:text-gray-400',
          className
        )}
      />
    </div>
  );
}