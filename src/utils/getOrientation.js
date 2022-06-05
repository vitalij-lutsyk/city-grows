const getIsPortraitScreenMode = () => {
  const { screen, outerHeight, outerWidth } = window;
  const orientationType =
    (screen.orientation || {}).type ||
    screen.mozOrientation ||
    screen.msOrientation;
  return (
    outerHeight > outerWidth ||
    orientationType === "portrait-primary" ||
    orientationType === "portrait-secondary"
  );
};

export default getIsPortraitScreenMode;
