import React from 'react';
import './Slider.css';

const Slide = (props) => {
  return (
    <div className="container-slide">
      <div className="headname">{props.name}</div>
      <div>
        <div className="des">Promotion: {props.des}</div>
        <div>
          <img src={props.img} alt={props.name} loading="lazy" decoding="async" />
        </div>
      </div>
    </div>
  );
};

export default Slide;
