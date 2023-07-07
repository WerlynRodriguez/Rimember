import * as Localization from 'expo-localization';
import { Dict, I18n } from 'i18n-js';

export enum tKeys {
    errAssets = 'errAssts',
    seenAlbums = 'snAlbms',
    loading = 'ldng',
    actionNoAvailable = 'actNoAv',
    noAlbums = 'noAlbms',
    noAssets = 'noAsst',
    home = 'hme',
    albums = 'albms',
    settings = 'sttngs',
    reqPermission = 'reqPrmssn',
    errSetAlbums = 'errStAlbms',
    warResetHistory = 'warRstHstry',
    warResetAll = 'warRstAll',
    intLoad = 'initLoad',
    descIntLoad = 'dscIntLoad',
    maxSizHist = 'maxSizHist',
    descMaxSizHist = 'dscMaxSizHist',
    timeAutoScrl = 'timeAutoScrl',
    descTimeAutoScrl = 'dscTimeAutoScrl',
    about = 'abt',
    resetHistory = 'rstHstry',
    resetAll = 'rstAll',
    whatIsApp = 'whIsRmbr',
    descWhatIsApp = 'dscWhIsRmbr',
    howToUse = 'howToUse',
    descHowToUse = 'dscHowToUse',
    whatHappens = 'whHppns',
    descWhatHappens = 'dscWhHppns',
    aboutDev = 'abtDev',
    descAboutDev = 'dscAbtDev',
    moreUpdates = 'mrUpdts',
    descMoreUpdates = 'dscMrUpdts',
    wantSupport = 'wntSpprt',
    descWantSupport = 'dscWntSpprt',
    actionyes = 'actYes',
    actionno = 'actNo'
}



const i18n = new I18n({
    es: {
        [tKeys.errAssets]: 'Error al cargar los archivos',
        [tKeys.seenAlbums]: 'Has visto todos los álbumes',
        [tKeys.loading]: 'Cargando',
        [tKeys.actionNoAvailable]: 'Acción no disponible en este dispositivo',
        [tKeys.noAlbums]: 'No hay álbumes seleccionados',
        [tKeys.noAssets]: 'No hay archivos disponibles',
        [tKeys.home]: 'Inicio',
        [tKeys.albums]: 'Álbumes',
        [tKeys.settings]: 'Ajustes',
        [tKeys.reqPermission]: 'Se requiere permiso para acceder',
        [tKeys.errSetAlbums]: 'Hubo un error al guardar los cambios, por favor elimine estos los álbumes de su selección',
        [tKeys.warResetHistory]: 'Esta accion reiniciará el historial de reproducción',
        [tKeys.warResetAll]: 'Esta acción reiniciará todos los ajustes, y la app volverá a su estado inicial',
        [tKeys.intLoad]: 'Archivos cargados',
        [tKeys.descIntLoad]: 'El número máximo de archivos cargados al principio.',
        [tKeys.maxSizHist]: 'Tamaño máximo del historial',
        [tKeys.descMaxSizHist]: 'El número máximo de archivos en el historial de reproducción. Si está lleno, se eliminarán los archivos más antiguos.',
        [tKeys.timeAutoScrl]: 'Tiempo de desplazamiento automático',
        [tKeys.descTimeAutoScrl]: 'El tiempo en segundos que se desplazará automáticamente a la siguiente imagen. Si es un video, se desplazará al final del video.',
        [tKeys.about]: 'Acerca de',
        [tKeys.resetHistory]: 'Reiniciar historial',
        [tKeys.resetAll]: 'Reiniciar todo',
        [tKeys.whatIsApp]: '¿Qué es Rimember?',
        [tKeys.descWhatIsApp]: 'Rimember es una aplicacion que te permite ver tus fotos y videos de los albums que tu selecciones, de manera aleatoria. Sin necesidad de estar conectado a internet, ya que ningun dato se guarda en la nube',
        [tKeys.howToUse]: '¿Cómo se usa?',
        [tKeys.descHowToUse]: 'Al entrar por primera vez a la aplicacion, tendras que seleccionar los albums que quieres que se muestren (deberas proporcionar permisos). Al finalizar la seleccion, deberas guardar los cambios. Una vez hecho esto, podras ver tus fotos y videos de manera aleatoria en la pantalla principal o Home, haciendo scroll hacia abajo',
        [tKeys.whatHappens]: '¿Qué pasa al salir?',
        [tKeys.descWhatHappens]: 'Algunas cosas como la seleccion de los albums y los ajustes de la aplicacion se guardan automaticamente. Sin embargo, el historial se perderá al salir de la aplicacion',
        [tKeys.aboutDev]: 'Acerca del desarrollador',
        [tKeys.descAboutDev]: 'Hola! Mi nombre es Werlyn, soy un desarrollador de software, estudiante de ingenieria en computación. Hice esta app, por varias razones, la primera es que queria ver mis fotos con mi novia desde mi galeria, pero no queria que fuera en orden, si no aleatorio. La segunda es que estoy generando mi portafolio con proyectos personales, y esta app es uno de ellos. Estas son algunas de mis redes sociales, por si quieres contactarme o ver mis otros proyectos',
        [tKeys.moreUpdates]: '¿Más actualizaciones?',
        [tKeys.descMoreUpdates]: 'No, como dije anteriormente, estoy generando mi portafolio, por lo que no tengo planeado seguir trabajando en esta app.',
        [tKeys.wantSupport]: '¿Quieres apoyarme?',
        [tKeys.descWantSupport]: 'Si quieres apoyarme, puedes hacerlo mediante una donación en PayPal o también me puedes comprar un café. ¿No puedes apoyarme economicamente? No te preocupes, puedes apoyarme compartiendo la app con tus amigos y familiares. ¿No tienes amigos? No pasa nada, ya me has apoyado con solo descargar la app, gracias por eso :)',
        [tKeys.actionyes]: 'Sí, estoy seguro',
        [tKeys.actionno]: 'Cancelar'
    },
    en: {
        [tKeys.errAssets]: 'Error loading files',
        [tKeys.seenAlbums]: 'You have seen all the albums',
        [tKeys.loading]: 'Loading',
        [tKeys.actionNoAvailable]: 'Action not available on this device',
        [tKeys.noAlbums]: 'No albums selected',
        [tKeys.noAssets]: 'No files available',
        [tKeys.home]: 'Home',
        [tKeys.albums]: 'Albums',
        [tKeys.settings]: 'Settings',
        [tKeys.reqPermission]: 'Permission is required to access',
        [tKeys.errSetAlbums]: 'There was an error saving the changes, please remove these albums from your selection',
        [tKeys.warResetHistory]: 'This action will reset the playback history',
        [tKeys.warResetAll]: 'This action will reset all settings, and the app will return to its initial state',
        [tKeys.intLoad]: 'Loaded files',
        [tKeys.descIntLoad]: 'The maximum number of files loaded at the beginning.',
        [tKeys.maxSizHist]: 'Maximum history size',
        [tKeys.descMaxSizHist]: 'The maximum number of files in the playback history. If it is full, the oldest files will be deleted.',
        [tKeys.timeAutoScrl]: 'Auto scroll time',
        [tKeys.descTimeAutoScrl]: 'The time in seconds that will automatically scroll to the next image. If it is a video, it will scroll to the end of the video.',
        [tKeys.about]: 'About',
        [tKeys.resetHistory]: 'Reset history',
        [tKeys.resetAll]: 'Reset all',
        [tKeys.whatIsApp]: 'What is Rimember?',
        [tKeys.descWhatIsApp]: 'Rimember is an application that allows you to view your photos and videos from the albums you select, randomly. Without the need to be connected to the internet, since no data is saved in the cloud',
        [tKeys.howToUse]: 'How to use?',
        [tKeys.descHowToUse]: 'When you first enter the application, you will have to select the albums you want to be displayed (you must provide permissions). When you finish the selection, you must save the changes. Once this is done, you can see your photos and videos randomly on the main screen or Home, scrolling down',
        [tKeys.whatHappens]: 'What happens when you leave?',
        [tKeys.descWhatHappens]: 'Some things like the selection of the albums and the settings of the application are saved automatically. However, the history will be lost when you exit the application',
        [tKeys.aboutDev]: 'About the developer',
        [tKeys.descAboutDev]: 'Hi! My name is Werlyn, I am a software developer, computer engineering student. I made this app, for several reasons, the first is that I wanted to see my photos with my girlfriend from my gallery, but I didn\'t want it to be in order, but random. The second is that I am generating my portfolio with personal projects, and this app is one of them. These are some of my social networks, in case you want to contact me or see my other projects',
        [tKeys.moreUpdates]: 'More updates?',
        [tKeys.descMoreUpdates]: 'No, as I said before, I am generating my portfolio, so I do not plan to continue working on this app.',
        [tKeys.wantSupport]: 'Do you want to support me?',
        [tKeys.descWantSupport]: 'If you want to support me, you can do it by donating on PayPal or you can also buy me a coffee. Can\'t you support me economically? Don\'t worry, you can support me by sharing the app with your friends and family. Don\'t you have friends? It doesn\'t matter, you have already supported me just by downloading the app, thanks for that :)',
        [tKeys.actionyes]: 'Yes, I\'m sure',
        [tKeys.actionno]: 'Cancel'
    },
    ja: {
        [tKeys.errAssets]: 'ファイルの読み込み中にエラーが発生しました',
        [tKeys.seenAlbums]: 'すべてのアルバムを見ました',
        [tKeys.loading]: '読み込み中',
        [tKeys.actionNoAvailable]: 'このデバイスでは利用できないアクション',
        [tKeys.noAlbums]: '選択されたアルバムはありません',
        [tKeys.noAssets]: '利用可能なファイルはありません',
        [tKeys.home]: 'ホーム',
        [tKeys.albums]: 'アルバム',
        [tKeys.settings]: '設定',
        [tKeys.reqPermission]: 'アクセスするには許可が必要です',
        [tKeys.errSetAlbums]: '変更を保存する際にエラーが発生しました。選択からこれらのアルバムを削除してください',
        [tKeys.warResetHistory]: 'このアクションは再生履歴をリセットします',
        [tKeys.warResetAll]: 'このアクションはすべての設定をリセットし、アプリは初期状態に戻ります',
        [tKeys.intLoad]: '読み込まれたファイル',
        [tKeys.descIntLoad]: '最初に読み込まれるファイルの最大数。',
        [tKeys.maxSizHist]: '最大履歴サイズ',
        [tKeys.descMaxSizHist]: '再生履歴にあるファイルの最大数。いっぱいの場合、最も古いファイルが削除されます。',
        [tKeys.timeAutoScrl]: '自動スクロール時間',
        [tKeys.descTimeAutoScrl]: '次の画像に自動的にスクロールする時間（秒単位）。ビデオの場合は、ビデオの最後までスクロールします。',
        [tKeys.about]: '約',
        [tKeys.resetHistory]: '履歴をリセット',
        [tKeys.resetAll]: 'すべてリセット',
        [tKeys.whatIsApp]: 'Rimemberとは？',
        [tKeys.descWhatIsApp]: 'Rimemberは、選択したアルバムから写真やビデオをランダムに表示できるアプリです。クラウドにデータが保存されないため、インターネットに接続する必要はありません',
        [tKeys.howToUse]: '使い方',
        [tKeys.descHowToUse]: 'アプリに初めて入ると、表示するアルバムを選択する必要があります（権限を提供する必要があります）。選択を終了すると、変更を保存する必要があります。これが完了すると、メイン画面またはホームで写真やビデオをランダムに表示できます',
        [tKeys.whatHappens]: '出ると何が起こるの？',
        [tKeys.descWhatHappens]: 'アルバムの選択やアプリの設定など、いくつかのことは自動的に保存されます。ただし、アプリを終了すると履歴が失われます',
        [tKeys.aboutDev]: '開発者について',
        [tKeys.descAboutDev]: 'こんにちは！私の名前はWerlynです。私はソフトウェア開発者で、コンピュータ工学の学生です。私はこのアプリをいくつかの理由で作りました。1つ目は、ギャラリーから私のガールフレンドと私の写真を見たかったのですが、順番ではなくランダムにしたかったからです。 2番目は、個人プロジェクトでポートフォリオを作成しているので、このアプリはその1つです。これらは私のソーシャルネットワークのいくつかです。私に連絡したり、他のプロジェクトを見たりする場合は、ご自由にどうぞ',
        [tKeys.moreUpdates]: 'アップデートはもっとありますか？',
        [tKeys.descMoreUpdates]: 'いいえ、前述のように、私はポートフォリオを作成しているので、このアプリで作業を続ける予定はありません。',
        [tKeys.wantSupport]: '私をサポートしたいですか？',
        [tKeys.descWantSupport]: '私をサポートしたい場合は、PayPalで寄付するか、コーヒーを買ってもらえます。経済的にサポートできない場合は心配しないでください。アプリを友達や家族と共有することでサポートできます。友達はいませんか？大丈夫です、アプリをダウンロードするだけで私をサポートしてくれました。ありがとうございました：）',
        [tKeys.actionyes]: 'はい、確信しています',
        [tKeys.actionno]: 'キャンセル'
    }
})

// Set the locale once at the beginning of your app.
i18n.locale = Localization.getLocales()[0].languageCode

i18n.enableFallback = true

export const tr = (key: string) => i18n.t(key)