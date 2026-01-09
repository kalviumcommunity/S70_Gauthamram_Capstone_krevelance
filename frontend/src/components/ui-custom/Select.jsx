import React, { useState, useEffect, useRef, createContext, useContext } from "react";

const SelectContext = createContext(null);

export const Select = ({ children, defaultValue, onValueChange, value, open, onOpenChange, ...props }) => {
    // Controlled or uncontrolled state
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [internalOpen, setInternalOpen] = useState(false);

    const isControlledValue = value !== undefined;
    const isControlledOpen = open !== undefined;

    const selectedValue = isControlledValue ? value : internalValue;
    const isOpen = isControlledOpen ? open : internalOpen;

    const handleValueChange = (newValue) => {
        if (!isControlledValue) setInternalValue(newValue);
        onValueChange?.(newValue);
    };

    const handleOpenChange = (newOpen) => {
        if (!isControlledOpen) setInternalOpen(newOpen);
        onOpenChange?.(newOpen);
    };

    return (
        <SelectContext.Provider value={{ selectedValue, isOpen, handleValueChange, handleOpenChange }}>
            <div className="relative" {...props}>
                {children}
            </div>
        </SelectContext.Provider>
    );
};

export const SelectGroup = ({ children, ...props }) => (
    <div {...props}>{children}</div>
);

export const SelectValue = ({ placeholder, children, ...props }) => {
    const { selectedValue } = useContext(SelectContext);
    // Note: We can't easily show the "label" of the selected item here without more complex logic 
    // or passing options. For now we will rely on children or placeholder, but in this specific app 
    // the SelectValue in usages is mostly static or handled by parent displaying state.
    // Actually, looking at usages: <SelectValue placeholder="All Combined Data" />
    // The visual update often happens because the parent updates the <SelectValue> content 
    // OR we need to map value to label. 
    // In shadcn/prop-types, <SelectValue> usually displays the label of the selected option.
    // However, since we don't have access to children props here easily, 
    // we might stick to simple behavior or let the user handle the display text in the Trigger.
    // Given the current usage in Dashboard/Analysis:
    // <SelectTrigger><SelectValue placeholder="..." /></SelectTrigger>
    // The SelectValue typically should show the selected text. 
    // BUT, in my previous implementation, I didn't enforce this mapping either.
    // The user's code:
    // <SelectTrigger ...>
    //    <SelectValue placeholder="Select Source Data" />
    // </SelectTrigger>
    // The generic shadcn behavior finds the selected item's text.
    // Let's implement a basic context-based lookup if we can, or just render children/placeholder.
    // IF the parent controls the text (which it doesn't seem to, it relies on SelectValue picking it up),
    // then SelectValue needs to know the label.
    // LIMITATION: Without complex registration, SelectValue doesn't look up labels.
    // PROPOSAL: We will just render children || placeholder. 
    // WAIT, in Dashboard.jsx usage: <SelectValue placeholder="All Combined Data" /> 
    // It doesn't pass the selected label. 
    // So if SelectedValue doesn't match, it will always show "All Combined Data".
    // I should fix the usages in Dashboard/Analysis to display the text explicitly 
    // OR implement a label store.

    // For now, let's fix the CLICK behavior first. The "can't select" is the main blocker.
    // But "displaying selection" is also critical.
    // I will try to make SelectTrigger render the selected label if possible.
    // Actually, simpler: I will update Dashboard.jsx and Analysis.jsx to pass the LABEL as children to SelectValue
    // based on their state, which is safer.

    return <span {...props}>{children || placeholder}</span>;
};

export const SelectTrigger = ({ className, onClick, children, ...props }) => {
    const { isOpen, handleOpenChange } = useContext(SelectContext);

    return (
        <div
            className={`flex h-10 w-full items-center justify-between rounded-md px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 cursor-pointer bg-white/5 border border-white/10 ${className}`}
            onClick={(e) => {
                onClick?.(e);
                handleOpenChange(!isOpen);
            }}
            {...props}
        >
            {children}
            <div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 opacity-50 text-white"
                >
                    <path d="M7 10l5 5 5-5" />
                </svg>
            </div>
        </div>
    );
};

export const SelectContent = ({ className, children, ...props }) => {
    const { isOpen, handleOpenChange } = useContext(SelectContext);
    const contentRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (contentRef.current && !contentRef.current.contains(event.target)) {
                // Check if click was on trigger? 
                // The simple outside click is fine because Trigger is distinct in DOM.
                // We rely on parent state for isOpen.
            }
            // Actually simpler: we bind the close on click outside.
            // But if we click the Trigger, the Trigger's click handler fires too.
            // If Trigger toggles, and we close, we might have a race/double toggle.
            // Standard approach: Trigger stops propagation or we check target.
            // For now, let's just use a simple close if clicking purely outside.
            if (isOpen && contentRef.current && !contentRef.current.contains(event.target)) {
                // Check if target is not part of the trigger (optional optimization)
                handleOpenChange(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, handleOpenChange]);

    if (!isOpen) return null;

    return (
        <div
            ref={contentRef}
            className={`absolute z-[9999] min-w-full w-auto overflow-hidden rounded-md border border-white/10 bg-[#232323] text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 ${className}`}
            style={{ top: "100%", marginTop: "0.25rem" }}
            {...props}
        >
            <div className="p-1 max-h-96 overflow-y-auto">
                {children}
            </div>
        </div>
    );
};

export const SelectItem = ({ className, value, onClick, children, ...props }) => {
    const { selectedValue, handleValueChange, handleOpenChange } = useContext(SelectContext);
    const isSelected = selectedValue === value;

    return (
        <div
            className={`relative flex min-w-full w-auto whitespace-nowrap cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-white/10 focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer ${isSelected ? 'text-[#0FCE7C]' : 'text-white'} ${className}`}
            onClick={(e) => {
                onClick?.(e);
                handleValueChange(value);
                handleOpenChange(false);
            }}
            data-selected={isSelected}
            {...props}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {isSelected && (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                    >
                        <path d="M20 6L9 17l-5-5" />
                    </svg>
                )}
            </span>
            {children}
        </div>
    );
};
