import { useState, type MouseEventHandler } from 'react';

interface MyButtonProps {
    count: number;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
}

function MyButton({count, onClick} : MyButtonProps) {

    return (
        <button onClick={onClick}>
            Clicked {count} times
        </button>
    );
}
export default MyButton;