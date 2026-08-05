import logo from '../../assets/icons/logo.svg'
import './Header.css'

/** Brand header: logo mark plus the product wordmark. */
export function Header() {
  return (
    <header className="header">
      <img src={logo} alt="" aria-hidden="true" className="header__logo" />
      <span className="header__brand">translated.io</span>
    </header>
  )
}
