import React from "react";
import { X } from "lucide-react";

const TutorialModal = ({ tutorialData, onClose }) => {
	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center py-4 px-3">
			<div className="bg-white/60 backdrop-blur-md rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
				{/* Header with close button */}
				<div className="flex justify-between items-center pt-4 px-4">
					<h2 className="text-xl font-semibold text-gray-900">
						{tutorialData.title}
					</h2>
					<button
						onClick={onClose}
						className="p-1 hover:bg-gray-100 rounded"
					>
						<X className="w-5 h-5 text-gray-500" />
					</button>
				</div>

				{/* Tutorial content */}
				<div className="p-4">
					{/* Tutorial image */}
					<div className="mb-4">
						<img
							src={tutorialData.image}
							alt="Tutorial"
							className="w-full h-auto object-cover rounded"
						/>
					</div>

					{/* Description */}
					<p className="text-gray-700 mb-2 text-sm leading-relaxed">
						{tutorialData.description}
					</p>

					{/* Bullet points */}
					<ul className="list-disc text-sm pl-5 mb-4 text-gray-700">
						{tutorialData.bullets.map((bullet, index) => (
							<li key={index} className="mb-1">{bullet}</li>
						))}
					</ul>

					{/* Close button */}
					<button
						onClick={onClose}
						className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition-colors"
					>
						ปิด
					</button>
				</div>
			</div>
		</div>
	);
};

export default TutorialModal;
