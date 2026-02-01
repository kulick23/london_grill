import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import s from './Header.module.css';
import logo from '../../assets/icons/logo.png';
import cartIcon from '../../assets/icons/Cart.svg';
import orderStore from '../../store/OrderStore';
import { observer } from 'mobx-react-lite';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase';

const Header = observer(() => {
    const itemsCount = orderStore.orders.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsub();
    }, []);

    return (
        <nav className={s.nav}>
            <NavLink to="/" className={s.brandLink} aria-label="Go to home">
                <div className={s.brand}>
                <img className={s.logo} src={logo} alt="Bar logo" loading="lazy" decoding="async" />
                <div className={s.brandText}>
                    <span className={s.brandName}>London Grill</span>
                    <span className={s.brandTag}>Grill & Bar</span>
                </div>
                </div>
            </NavLink>
            <div className={s.links}>
                <NavLink to="/menu" className={({ isActive }) => `${s.link} ${isActive ? s.active : ''}`}>Menu</NavLink>
                <NavLink to="/events" className={({ isActive }) => `${s.link} ${isActive ? s.active : ''}`}>Events</NavLink>
                {user ? (
                    <NavLink to="/orders" className={s.cartButton} aria-label="Open cart">
                        {itemsCount > 0 ? <span className={s.cartBadge}>{itemsCount}</span> : null}
                        <img src={cartIcon} alt="Cart" loading="lazy" decoding="async" />
                    </NavLink>
                ) : (
                    <NavLink to="/auth" className={s.loginButton}>Login</NavLink>
                )}
            </div>
        </nav>

    )
});
export default Header
