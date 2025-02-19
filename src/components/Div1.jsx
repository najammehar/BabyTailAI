import React from 'react';
import ProgressBar from './ProgressBar';
import { useStory } from '../context/StoryContext';

const getProgressColor = (wordCount) => {
  const colorMap = { 19: 'red', 17: 'yellow', 18: 'yellow', default: 'green' };
  return colorMap[wordCount % 20] || colorMap.default;
};

const Div1 = () => {
  const { wordCount } = useStory();
  const progress = (wordCount % 20) * (100 / 20);
  const progressColor = getProgressColor(wordCount);

  return (
    <div>
      <ProgressBar
        progress={progress}
        progressColor={progressColor}
        className="absolute mt-[.1rem] w-[95%] h-1 sm:w-[60%] md:w-[60%] lg:w-[60%]"
      />
    </div>
  );
};

export default Div1;