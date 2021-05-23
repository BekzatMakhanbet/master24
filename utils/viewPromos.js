import increaseViewCount from './increaseViewCount';

export default (promos) => {
  promos.forEach((promo) => {
    increaseViewCount('BANNER', promo.id);
  });
};
