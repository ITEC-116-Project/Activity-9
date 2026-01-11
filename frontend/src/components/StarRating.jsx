import { useState, useEffect } from 'react';
import './StarRating.css';

const StarRating = ({ 
  rating = 0, 
  totalRatings = 0, 
  editable = false, 
  onRate = null,
  size = 'medium'
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(rating);

  useEffect(() => {
    setSelectedRating(rating);
  }, [rating]);

  const handleClick = (star) => {
    if (editable && onRate) {
      setSelectedRating(star);
      onRate(star);
    }
  };

  const displayRating = editable 
    ? (hoverRating || selectedRating || 0) 
    : rating;

  const renderStar = (star) => {
    const filled = star <= displayRating;
    const halfFilled = !filled && star - 0.5 <= displayRating;
    
    return (
      <span
        key={star}
        className={`star ${filled ? 'filled' : ''} ${halfFilled ? 'half' : ''} ${editable ? 'editable' : ''}`}
        onClick={() => handleClick(star)}
        onMouseEnter={() => editable && setHoverRating(star)}
        onMouseLeave={() => editable && setHoverRating(0)}
      >
        {filled ? '★' : halfFilled ? '★' : '☆'}
      </span>
    );
  };

  return (
    <div className={`star-rating ${size}`}>
      <div className="stars">
        {[1, 2, 3, 4, 5].map(renderStar)}
      </div>
      {!editable && totalRatings > 0 && (
        <span className="rating-text">
          {Number(rating).toFixed(1)} ({totalRatings} {totalRatings === 1 ? 'review' : 'reviews'})
        </span>
      )}
      {!editable && totalRatings === 0 && (
        <span className="rating-text no-ratings">No reviews yet</span>
      )}
      {editable && selectedRating > 0 && (
        <span className="rating-text selected">You selected: {selectedRating} star{selectedRating > 1 ? 's' : ''}</span>
      )}
    </div>
  );
};

export default StarRating;
