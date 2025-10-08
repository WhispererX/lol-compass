import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus } from 'react-icons/fa';
import PrimaryButton from './PrimaryButton';

const MATCH_RESULTS = ['WIN', 'LOSS', 'REMAKE'];
const ROLES = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY'];
const ROLE_DISPLAY = {
	TOP: 'Top Lane',
	JUNGLE: 'Jungle',
	MIDDLE: 'Mid Lane',
	BOTTOM: 'ADC',
	UTILITY: 'Support',
};

const PREDEFINED_NOTES = [
	// Macro / Map
	'No vision',
	'Ignored objective',
	'Late rotation',
	'Overstayed lane',
	'Split wrong time',
	'Ignored wave state',
	'Missed roam',
	'Ignored ping',
	'Bad recall timing',
	'Face-checked bush',

	// Micro / Mechanics
	'Missed skillshot',
	'Wasted flash',
	'Misused ability',
	'Poor spacing',
	'Bad trade',
	'Wrong target',
	'Overchased',
	'Early engage',
	'Late reaction',
	'Missed combo',

	// Mindset / Decision
	'Tilt play',
	'Forced fight',
	'Ignored win condition',
	'Tunnel vision',
	'Greedy recall',
	'Underestimated enemy',
	'Overconfident dive',
	'Panic ult',
	'Forgot cooldowns',
	'Ignored power spike',

	// Team / Communication
	'Ignored call',
	'Flame typed',
	'Didn’t ping',
	'No follow-up',
	'Bad shotcall',
	'Solo objective',
];

export default function AddMatchDialog({
	champions,
	onAdd,
	onClose,
	editMatch,
	onEdit,
}) {
	const [formData, setFormData] = useState({
		result: editMatch?.result || '',
		role: editMatch?.role || '',
		championPlayed: editMatch?.championPlayed || '',
		championVs: editMatch?.championVs || '',
		kills: editMatch?.kills?.toString() || '',
		deaths: editMatch?.deaths?.toString() || '',
		assists: editMatch?.assists?.toString() || '',
		cs: editMatch?.cs?.toString() || '',
		notes: editMatch?.notes || [],
	});

	const [championList, setChampionList] = useState([]);
	const [customNote, setCustomNote] = useState('');
	const [errors, setErrors] = useState({});

	useEffect(() => {
		if (champions) {
			const champList = Object.values(champions)
				.map((champ) => champ.name)
				.sort();
			setChampionList(champList);
		}
	}, [champions]);

	const handleInputChange = (field, value) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));

		if (errors[field]) {
			setErrors((prev) => ({
				...prev,
				[field]: null,
			}));
		}
	};

	const handleNoteToggle = (note) => {
		setFormData((prev) => ({
			...prev,
			notes: prev.notes.includes(note)
				? prev.notes.filter((n) => n !== note)
				: [...prev.notes, note],
		}));
	};

	const handleAddCustomNote = () => {
		if (customNote.trim() && !formData.notes.includes(customNote.trim())) {
			setFormData((prev) => ({
				...prev,
				notes: [...prev.notes, customNote.trim()],
			}));
			setCustomNote('');
		}
	};

	const removeNote = (noteToRemove) => {
		setFormData((prev) => ({
			...prev,
			notes: prev.notes.filter((note) => note !== noteToRemove),
		}));
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.result) newErrors.result = 'Match result is required';
		if (!formData.role) newErrors.role = 'Role is required';
		if (!formData.championPlayed)
			newErrors.championPlayed = 'Champion played is required';
		if (!formData.championVs) newErrors.championVs = 'Champion vs is required';
		if (!formData.kills && formData.kills !== '0')
			newErrors.kills = 'Kills is required';
		if (!formData.deaths && formData.deaths !== '0')
			newErrors.deaths = 'Deaths is required';
		if (!formData.assists && formData.assists !== '0')
			newErrors.assists = 'Assists is required';

		if (formData.kills && isNaN(formData.kills))
			newErrors.kills = 'Must be a number';
		if (formData.deaths && isNaN(formData.deaths))
			newErrors.deaths = 'Must be a number';
		if (formData.assists && isNaN(formData.assists))
			newErrors.assists = 'Must be a number';

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		if (!validateForm()) return;

		const matchData = {
			...formData,
			kda: `${formData.kills}/${formData.deaths}/${formData.assists}`,
			kills: parseInt(formData.kills),
			deaths: parseInt(formData.deaths),
			assists: parseInt(formData.assists),
			cs: formData.cs ? parseInt(formData.cs) : null,
		};

		if (editMatch) {
			onEdit(editMatch.id, matchData);
		} else {
			onAdd(matchData);
		}
		onClose();
	};

	return (
		<div className="dialog-overlay">
			<div className="dialog-container">
				<div className="dialog-header">
					<h2>{editMatch ? 'Edit Manual Match' : 'Add Manual Match'}</h2>
					<button className="close-btn" onClick={onClose}>
						<FaTimes />
					</button>
				</div>

				<form className="dialog-form" onSubmit={handleSubmit}>
					<div className="form-row">
						<div className="form-group">
							<label htmlFor="result">Match Result *</label>
							<select
								id="result"
								value={formData.result}
								onChange={(e) => handleInputChange('result', e.target.value)}
								className={errors.result ? 'error' : ''}>
								<option value="">Select result...</option>
								{MATCH_RESULTS.map((result) => (
									<option key={result} value={result}>
										{result}
									</option>
								))}
							</select>
							{errors.result && (
								<span className="error-text">{errors.result}</span>
							)}
						</div>

						<div className="form-group">
							<label htmlFor="role">Role *</label>
							<select
								id="role"
								value={formData.role}
								onChange={(e) => handleInputChange('role', e.target.value)}
								className={errors.role ? 'error' : ''}>
								<option value="">Select role...</option>
								{ROLES.map((role) => (
									<option key={role} value={role}>
										{ROLE_DISPLAY[role]}
									</option>
								))}
							</select>
							{errors.role && <span className="error-text">{errors.role}</span>}
						</div>
					</div>

					<div className="form-row">
						<div className="form-group">
							<label htmlFor="championPlayed">Champion Played *</label>
							<select
								id="championPlayed"
								value={formData.championPlayed}
								onChange={(e) =>
									handleInputChange('championPlayed', e.target.value)
								}
								className={errors.championPlayed ? 'error' : ''}>
								<option value="">Select champion...</option>
								{championList.map((champion) => (
									<option key={champion} value={champion}>
										{champion}
									</option>
								))}
							</select>
							{errors.championPlayed && (
								<span className="error-text">{errors.championPlayed}</span>
							)}
						</div>

						<div className="form-group">
							<label htmlFor="championVs">Champion Against *</label>
							<select
								id="championVs"
								value={formData.championVs}
								onChange={(e) =>
									handleInputChange('championVs', e.target.value)
								}
								className={errors.championVs ? 'error' : ''}>
								<option value="">Select champion...</option>
								{championList.map((champion) => (
									<option key={champion} value={champion}>
										{champion}
									</option>
								))}
							</select>
							{errors.championVs && (
								<span className="error-text">{errors.championVs}</span>
							)}
						</div>
					</div>

					<div className="form-row">
						<div className="form-group kda-group">
							<label>KDA *</label>
							<div className="kda-inputs">
								<input
									type="number"
									placeholder="Kills"
									value={formData.kills}
									onChange={(e) => handleInputChange('kills', e.target.value)}
									className={errors.kills ? 'error' : ''}
									min="0"
								/>
								<span className="kda-separator">/</span>
								<input
									type="number"
									placeholder="Deaths"
									value={formData.deaths}
									onChange={(e) => handleInputChange('deaths', e.target.value)}
									className={errors.deaths ? 'error' : ''}
									min="0"
								/>
								<span className="kda-separator">/</span>
								<input
									type="number"
									placeholder="Assists"
									value={formData.assists}
									onChange={(e) => handleInputChange('assists', e.target.value)}
									className={errors.assists ? 'error' : ''}
									min="0"
								/>
							</div>
							{(errors.kills || errors.deaths || errors.assists) && (
								<span className="error-text">
									All KDA values are required and must be numbers
								</span>
							)}
						</div>

						<div className="form-group">
							<label htmlFor="cs">CS (Creep Score)</label>
							<input
								id="cs"
								type="number"
								placeholder="CS..."
								value={formData.cs}
								onChange={(e) => handleInputChange('cs', e.target.value)}
								min="0"
							/>
						</div>
					</div>

					<div className="form-group notes-group">
						<label>Notes</label>

						<div className="custom-note-input">
							<input
								type="text"
								placeholder="Add custom note..."
								value={customNote}
								onChange={(e) => setCustomNote(e.target.value)}
								onKeyPress={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										handleAddCustomNote();
									}
								}}
							/>
							<button
								type="button"
								className="add-note-btn"
								onClick={handleAddCustomNote}
								disabled={!customNote.trim()}>
								<FaPlus />
							</button>
						</div>

						<div className="predefined-notes">
							{PREDEFINED_NOTES.map((note) => (
								<button
									key={note}
									type="button"
									className={`note-option ${
										formData.notes.includes(note) ? 'selected' : ''
									}`}
									onClick={() => handleNoteToggle(note)}>
									{note}
								</button>
							))}
						</div>

						{formData.notes.length > 0 && (
							<div className="selected-notes">
								<span className="notes-label">Selected Notes:</span>
								<div className="notes-list">
									{formData.notes.map((note) => (
										<span key={note} className="selected-note">
											{note}
											<button
												type="button"
												className="remove-note"
												onClick={() => removeNote(note)}>
												<FaTimes />
											</button>
										</span>
									))}
								</div>
							</div>
						)}
					</div>

					<div className="dialog-actions">
						<button type="button" className="cancel-btn" onClick={onClose}>
							Cancel
						</button>
						<PrimaryButton type="submit">
							{editMatch ? 'Update Match' : 'Add Match'}
						</PrimaryButton>
					</div>
				</form>
			</div>
		</div>
	);
}
