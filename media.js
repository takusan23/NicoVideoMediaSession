
// 読み込みが終わったら
window.onload = () => {
    // マイリスの連続再生ではHTML内にあるJSONは書き換わらないので、DOM（HTML）を監視して、曲の変更に対応する
    // というわけでね、スクレイピングします。れっつDOM操作

    // タイトル
    const videoTitleElement = document.getElementsByClassName('VideoTitle')[0]
    // 投稿者名
    const uploaderNameElement = document.getElementsByClassName('Link VideoOwnerInfo-pageLink')[0]
    // 動画ID
    const videoId = location.href.match('(sm|so)([0-9]+)')[0]
    // サムネ（取れんから投稿者アイコン）
    const uploaderIcon = document.getElementsByClassName('Image VideoOwnerIcon-image')[0]

    // MediaSession登録
    setMediaSession(
        videoTitleElement.textContent,
        uploaderNameElement.textContent,
        videoId,
        uploaderIcon.getAttribute('src')
    )

    // DOMの変更を検知するオブザーバー
    const observer = new MutationObserver(callback => {
        console.log('曲変更')
        // 曲が変わったのでMediaSession再登録
        setMediaSession(
            videoTitleElement.textContent,
            uploaderNameElement.textContent,
            videoId,
            uploaderIcon.getAttribute('src')
        )
    })

    // オブザーバーへ登録。
    observer.observe(
        document.getElementsByTagName('body')[0], // body指定しとけば大丈夫感
        { attributes: true, childList: true, characterData: true }
    )

}

// なんか動かん
const getThumbUrl = () => {
    if (document.getElementsByClassName('PlaylistItemList-item currentItem')[0] !== undefined) {
        // マイリスト再生時はマイリスト一覧から現在再生中の動画を探してサムネのURLを強引に取る
        const url = document.getElementsByClassName('PlaylistItemList-item currentItem')[0].getElementsByClassName('Thumbnail')[0].style.backgroundImage.replace('url("', '').replace('")', '')
        return url
    } else {
        // 通常再生時
        const json = JSON.parse(document.getElementById('js-initial-watch-data').getAttribute('data-api-data'))
        return json.video.thumbnailURL
    }
}

/**
 * MediaSessionAPI登録関数。
 */
const setMediaSession = (title, uploaderName, videoId, thumb) => {
    if ('mediaSession' in navigator) {
        // 表示するもの
        navigator.mediaSession.metadata = new MediaMetadata({
            title: title,
            artist: uploaderName,
            album: videoId,
            artwork: [{ src: thumb, sizes: '128x128', type: 'image/png' }]
        });
        // 操作ボタン各位
        const buttonList = document.getElementsByClassName('ActionButton ControllerButton')
        // 再生、一時停止
        const playOrPauseButtonElement = buttonList[0]
        // 最初へ
        const firstSeekButtonElement = buttonList[2]
        // 10秒戻す
        const backwardButtonElement = buttonList[3]
        // 10秒飛ばす
        const forwardButtonElement = buttonList[4]
        // 次の曲へ
        const nextButtonElement = buttonList[5]
        // 操作
        navigator.mediaSession.setActionHandler('play', () => {
            buttonList[0].click()
        });
        navigator.mediaSession.setActionHandler('pause', () => {
            buttonList[0].click()
        });
        navigator.mediaSession.setActionHandler('seekbackward', () => { backwardButtonElement.click() });
        navigator.mediaSession.setActionHandler('seekforward', () => { forwardButtonElement.click() });
        navigator.mediaSession.setActionHandler('previoustrack', () => { firstSeekButtonElement.click() });
        navigator.mediaSession.setActionHandler('nexttrack', () => { nextButtonElement.click() });
    }
}