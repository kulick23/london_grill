import { useState } from 'react';
import './Dropdown.css';

const Dropdown = ({ setSelectedTable }) => {
  const [selected, setSelected] = useState('Choose One');
  const [isActive, setIsActive] = useState(false);
  const options = ['table 1', 'table 2', 'table 3', 'table 4'];

  const handleSelect = (option) => {
    setSelected(option);
    setIsActive(false);
    setSelectedTable(option);
  };

  return (
    <div className="dropdown">
      <div className="dropdown-btn" onClick={() => setIsActive(!isActive)}>
        {selected}
        <span className="fas fa-caret-down"></span>
      </div>
      {isActive && (
        <div className="dropdown-content">
          {options.map((option) => (
            <div key={option} onClick={() => handleSelect(option)} className="dropdown-item">
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
