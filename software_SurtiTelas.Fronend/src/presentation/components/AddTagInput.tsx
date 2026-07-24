import React, { useRef, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import s from '@/presentation/pages/admin/AdminCatalogo.module.css';

interface AddTagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder: string;
}

export const AddTagInput: React.FC<AddTagInputProps> = ({ tags, onTagsChange, placeholder }) => {
  const [inputValue, setInputValue] = React.useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onTagsChange([...tags, trimmed]);
    }
    setInputValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onTagsChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(t => t !== tagToRemove));
  };

  return (
    <div className={s.tagInputWrapper} onClick={() => inputRef.current?.focus()}>
      {tags.map(tag => (
        <span key={tag} className={s.tagChip}>
          {tag}
          <button type="button" className={s.tagRemoveBtn} onClick={() => removeTag(tag)}>
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        className={s.tagTextInput}
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (inputValue.trim()) addTag(); }}
        placeholder={tags.length === 0 ? placeholder : 'Escribe y presiona Enter...'}
      />
    </div>
  );
};
