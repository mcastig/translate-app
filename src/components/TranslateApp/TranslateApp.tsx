import { Header } from '../Header/Header'
import { TranslateForm } from '../TranslateForm/TranslateForm'
import './TranslateApp.css'

/** Page shell: space backdrop, brand header, and the translator. */
export function TranslateApp() {
  return (
    <div className="translate-app">
      <div className="translate-app__container">
        <Header />
        <main>
          <h1 className="translate-app__title">
            Translate text between languages
          </h1>
          <TranslateForm />
        </main>
      </div>
    </div>
  )
}
