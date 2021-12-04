import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';

export default function Header() {
  return (
    <div className={`${commonStyles.container} ${styles.headerContainer}`}>
      <img src="/Logo.svg" alt="logo" />
    </div>
  );
}
