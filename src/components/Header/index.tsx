import styles from './header.module.scss';
import commonStyles from '../../styles/common.module.scss';
import Link from 'next/link';

export default function Header() {
  return (
    <div className={`${commonStyles.container} ${styles.headerContainer}`}>
      <Link href="/">
        <a>
          <img src="/Logo.svg" alt="logo" />
        </a>
      </Link>
    </div>
  );
}
