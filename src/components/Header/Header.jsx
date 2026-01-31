import React from 'react';
import { NavLink } from 'react-router-dom';
import s from './Header.module.css'
import logo from '../../assets/icons/logo.png'

const Header = () => {
    return (
        <nav className={s.nav}>
            <div className={s.brand}>
                <img className={s.logo} src={logo} alt="Bar logo" loading="lazy" decoding="async" />
                <div className={s.brandText}>
                    <span className={s.brandName}>London Bar</span>
                    <span className={s.brandTag}>Grill & Bar</span>
                </div>
            </div>
            <div className={s.links}>
                <NavLink to="/" className={({ isActive }) => `${s.link} ${isActive ? s.active : ''}`}>Home</NavLink>
                <NavLink to="/profile" className={({ isActive }) => `${s.link} ${isActive ? s.active : ''}`}>Profile</NavLink>
                <NavLink to="/orders" className={({ isActive }) => `${s.link} ${isActive ? s.active : ''}`}>Orders</NavLink>
                <NavLink to="/menu" className={({ isActive }) => `${s.link} ${isActive ? s.active : ''}`}>Menu</NavLink>
                <NavLink to="/party" className={({ isActive }) => `${s.link} ${isActive ? s.active : ''}`}>Party</NavLink>
            </div>
        </nav>

    )
}
export default Header
