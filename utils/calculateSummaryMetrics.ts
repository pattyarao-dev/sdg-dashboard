export const calculateSummaryMetrics = (goalSummaryData, indicatorData) => {
    // Initialize summary metrics object
    const summaryMetrics = {
      totalIndicators: 0,
      totalSubIndicators: 0,
      onTrackIndicators: 0,
      slightlyOffTrackIndicators: 0,
      offTrackIndicators: 0,
      significantlyOffTrackIndicators: 0,
      mostImprovedIndicator: {
        name: 'N/A',
        improvement: 0,
        goalTitle: ''
      },
      leastImprovedIndicator: {
        name: 'N/A',
        improvement: 0,
        goalTitle: ''
      }
    };
  
    // Count total indicators and sub-indicators
    if (indicatorData && indicatorData.length > 0) {
      // Count main indicators
      const mainIndicators = indicatorData.filter(item => !item.parent_indicator_id);
      summaryMetrics.totalIndicators = mainIndicators.length;
      
      // Count sub-indicators
      const subIndicators = indicatorData.filter(item => item.parent_indicator_id);
      summaryMetrics.totalSubIndicators = subIndicators.length;
      
      // Calculate target achievement for each indicator
      const indicatorsWithProgress = indicatorData
        .filter(item => item.target && item.latest_value)
        .map(item => {
          const progressPercentage = (item.latest_value / item.target) * 100;
          return {
            ...item,
            progressPercentage,
            previousValue: item.previous_value || 0,
            improvement: item.previous_value ? 
              ((item.latest_value - item.previous_value) / item.previous_value) * 100 : 0
          };
        });
      
      // Count indicators by progress category
      summaryMetrics.onTrackIndicators = indicatorsWithProgress.filter(i => i.progressPercentage >= 90).length;
      summaryMetrics.slightlyOffTrackIndicators = indicatorsWithProgress.filter(i => i.progressPercentage >= 70 && i.progressPercentage < 90).length;
      summaryMetrics.offTrackIndicators = indicatorsWithProgress.filter(i => i.progressPercentage >= 50 && i.progressPercentage < 70).length;
      summaryMetrics.significantlyOffTrackIndicators = indicatorsWithProgress.filter(i => i.progressPercentage < 50).length;
      
      // Find most improved indicator
      if (indicatorsWithProgress.length > 0) {
        const mostImproved = indicatorsWithProgress.reduce((max, current) => 
          current.improvement > max.improvement ? current : max
        , { improvement: -Infinity });
        
        if (mostImproved && mostImproved.indicator_name) {
          const goal = goalSummaryData.find(g => g.goal_id === mostImproved.goal_id);
          summaryMetrics.mostImprovedIndicator = {
            name: mostImproved.indicator_name,
            improvement: mostImproved.improvement,
            goalTitle: goal ? goal.goal_name : ''
          };
        }
        
        // Find least improved indicator
        const leastImproved = indicatorsWithProgress.reduce((min, current) => 
          current.improvement < min.improvement ? current : min
        , { improvement: Infinity });
        
        if (leastImproved && leastImproved.indicator_name) {
          const goal = goalSummaryData.find(g => g.goal_id === leastImproved.goal_id);
          summaryMetrics.leastImprovedIndicator = {
            name: leastImproved.indicator_name,
            improvement: leastImproved.improvement,
            goalTitle: goal ? goal.goal_name : ''
          };
        }
      }
    }
    
    return summaryMetrics;
  };
  
  export default calculateSummaryMetrics;