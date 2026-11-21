'use client';

import React, { useEffect } from 'react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/admin-form';
import { EditorToolbar } from '../tiptap/editor-toolbar';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';

interface FormEditorProps<T extends FieldValues> {
    control: Control<T>;
    name: FieldPath<T>;
    label?: string;
    placeholder?: string;
    className?: string;
    form: any;
}

export const FormEditor = <T extends FieldValues>({
    control,
    name,
    label,
    className,
    form
}: FormEditorProps<T>) => {
    // === initialize tiptap editor ===
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Enter product description'
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right']
            })
        ],
        content: form.getValues(name),
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            form.setValue(name, html, { shouldValidate: true });
        }
    });

    // Update editor content when form value changes (for edit mode)
    useEffect(() => {
        if (editor) {
            const currentValue = form.getValues(name);
            // Only update if content is different to avoid cursor issues
            if (editor.getHTML() !== currentValue) {
                editor.commands.setContent(currentValue || '');
            }
        }
    }, [form, name, editor]);

    return (
        <FormField
            control={control}
            name={name}
            render={({}) => (
                <FormItem className={className}>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <div className='space-y-2'>
                            {editor && <EditorToolbar editor={editor} />}
                            <div className='rounded-lg border p-4'>
                                <EditorContent
                                    editor={editor}
                                    className='prose max-w-none'
                                />
                            </div>
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};

export default FormEditor;
