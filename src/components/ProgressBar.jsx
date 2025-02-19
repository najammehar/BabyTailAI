const ProgressBar = ({ progress, progressColor, className }) => {
    return (
      <div className={`relative ${className}`}>
        <div
          className="h-full rounded-full transition-all duration-300 ease-in-out"
          style={{
            width: `${progress}%`,
            backgroundColor: progressColor,
          }}
        />
      </div>
    );
  };
  
  export default ProgressBar;