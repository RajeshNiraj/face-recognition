import React from "react";

const FormInput = ({onChange, type, name}) => {
    return (
        <div>
            <input onChange={onChange} 
                className="pa2 input-reset ba bg-transparent hover-bg-black 
                           hover-white w-100" 
                type={type} name={name} id={name} />
        </div>
    )
}

export default FormInput;

