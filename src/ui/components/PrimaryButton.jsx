import React from 'react';

export default function PrimaryButton({
	children,
	onClick,
	type = 'button',
	disabled = false,
	className = '',
}) {
	return (
		<button
			type={type}
			onClick={onClick}
			disabled={disabled}
			className={`primary-button ${className}`}>
			<span className="primary-button-content">{children}</span>
		</button>
	);
}
