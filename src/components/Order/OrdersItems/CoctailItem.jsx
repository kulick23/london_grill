import React from 'react';
import s from './../Order.module.css';
import orderStore from '../../../store/OrderStore';
import { useI18n } from '../../../i18n/I18nProvider';

const CoctailItem = (props) => {
  const { t } = useI18n();
  const increaseQuantity = () => {
    orderStore.increaseQuantity(props.id);
  };

  const decreaseQuantity = () => {
    orderStore.decreaseQuantity(props.id);
  };

  const removeOrder = () => {
    orderStore.removeOrder(props.id);
  };

  return (
    <div className={s.coctail}>
      <img src={props.img} alt={props.name} className={s.coctailImage} loading="lazy" decoding="async" />
      <div className={s.amount2}>{props.name} </div>
      <div className={s.amount}>{props.price} $</div>
      <div className={s.quantity}>
        <button onClick={decreaseQuantity}>-</button>
        <span>{props.quantity}</span>
        <button onClick={increaseQuantity}>+</button>
      </div>
      <button onClick={removeOrder} className={s.removeButton}>{t('order.delete')}</button>
    
    </div>
  );
};

export default CoctailItem;
