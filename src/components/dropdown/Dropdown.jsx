import React, { useState } from 'react';
import './Dropdown.css';

const Dropdown = ({ options, onSelect, label }) => {
    const [isOpen, setIsOpen] = useState(false);


    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleSelect = (option) => {
        onSelect(option); // Вызываем функцию при выборе опции
        setIsOpen(false); // Закрываем выпадающий список
    };

    return (
        <div className="dropdown">
            <button onClick={toggleDropdown} className="text-xs font-medium w-24">
                {label}
            </button>
            {isOpen && (
                <div className="dropdown-menu text-xs font-medium">
                    {options.map((option, index) => (
                        <div key={index} className="dropdown-item" onClick={() => handleSelect(option)}>
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dropdown;
