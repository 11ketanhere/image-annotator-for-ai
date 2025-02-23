import React from 'react';
import './styles.css';
import logo from '../../components/assets/images/brand-logo.png';
const Header = ({ projectName }) => {
  return (
    <header className="app-header">
      <div className="logo">
        <img src={logo} alt="Brand Logo" className='brand-logo'/>
      </div>
      <div className="project-name">
        {projectName}
      </div>
    </header>
  );
};

export default Header;