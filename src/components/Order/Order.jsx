import React, { useEffect, useState } from 'react';
import s from './Order.module.css';
import CoctailItem from './OrdersItems/CoctailItem.jsx';
import Dropdown from './Dropdown';
import orderStore from '../../store/OrderStore';
import { observer } from 'mobx-react-lite';
import { auth } from '../../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nProvider';
import { useToast } from '../Toast/ToastProvider';

const Order = observer(() => {
  const [user, setUser] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const navigate = useNavigate();
  const { t } = useI18n();
  const { showToast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate('/auth');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/auth');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  if (!user) {
    return <div>{t('order.loading')}</div>;
  }

  const handleOrder = () => {
    if (selectedTable && orderStore.orders.length > 0) {
      showToast(t('order.accepted'), 'success');
      orderStore.clearOrders();
    }
  };

  const coctailElements = orderStore.orders.map((d, index) => (
    <CoctailItem
      key={index}
      name={d.name}
      id={d.id}
      price={d.price}
      img={d.image}
      quantity={d.quantity}
    />
  ));

  return (
    <div className={s.page}>
      <div className={s.header}>
        <h1>{t('order.title')}</h1>
        <p>{t('order.subtitle')}</p>
        <div className={s.profileRow}>
          <div className={s.profileNote}>
            {t('order.profileLabel')}: {user.email}
          </div>
          <button onClick={handleLogout} className={s.logoutButton}>
            {t('order.logout')}
          </button>
        </div>
      </div>
      {orderStore.orders.length > 0 ? (
        <div className={s.dialogsItems}>
          {coctailElements}
          <div className={s.actions}>
            <Dropdown setSelectedTable={setSelectedTable} />
            <button onClick={handleOrder} className={s.orderButton} disabled={!selectedTable}>
              {t('order.placeOrder')}
            </button>
            <button onClick={() => orderStore.clearOrders()} className={s.orderButtonSecondary}>
              {t('order.clearOrder')}
            </button>
          </div>
        </div>
      ) : (
        <div className={s.emptyText}>{t('order.empty')}</div>
      )}
    </div>
  );
});

export default Order;
