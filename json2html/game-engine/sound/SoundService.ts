import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import * as R from 'fp-ts/lib/Record'

import { sounds } from '../context'
import Sound from '../medias/Sound'
import Obj from '../Obj'
import Channel from './Channel'
import Volumes from './Volumes'

export default class SoundService {
    volumes: Volumes = Volumes.fromStorage()

    private channels: Obj<Channel>
    private mainMenuMusic: O.Option<Sound>

    constructor(private confirmAudio: (okAction: () => void) => void) {
        this.channels = {
            music: new Channel(confirmAudio, this.volumes.music, true)
        }
        this.mainMenuMusic = R.lookup('main_menu_music', sounds)
    }

    playMainMenuMusic = () => {
        pipe(
            this.channels,
            R.map(_ => _.stop())
        )
        pipe(
            this.mainMenuMusic,
            O.map(mainMenuMusic =>
                pipe(
                    R.lookup('music', this.channels),
                    O.map(_ => _.play(mainMenuMusic))
                )
            )
        )
    }

    stopChannels = () =>
        pipe(
            this.channels,
            R.map(_ => _.stop())
        )

    pauseChannels = () =>
        pipe(
            this.channels,
            R.map(_ => _.pause())
        )

    resumeChannels = () =>
        pipe(
            this.channels,
            R.map(_ => _.resume())
        )

    applySounds = (sounds: Obj<O.Option<Sound>>) =>
        pipe(
            sounds,
            R.mapWithIndex((chanName, sound) =>
                pipe(
                    R.lookup(chanName, this.channels),
                    O.alt(() =>
                        O.isSome(sound)
                            ? O.some(this.newChannel(chanName))
                            : O.none
                    ),
                    O.map(channel =>
                        pipe(
                            sound,
                            O.fold(
                                channel.stop,
                                this.playIfNotMusicAndAlready(chanName, channel)
                            )
                        )
                    )
                )
            )
        )

    private newChannel = (chanName: string): Channel => {
        const channel = new Channel(
            this.confirmAudio,
            chanName === 'voice' ? this.volumes.voice : this.volumes.sound
        )
        this.channels = {
            ...this.channels,
            [chanName]: channel
        }
        return channel
    }

    private playIfNotMusicAndAlready = (chanName: string, channel: Channel) => (
        sound: Sound
    ): void => {
        if (!(chanName === 'music' && channel.isAlreadyPlaying(sound))) {
            channel.play(sound)
        }
    }

    applyAudios = (audios: Sound[]) =>
        audios.map(_ => Sound.play(_.elt(this.volumes.sound)))

    setVolume = (chanName: keyof Volumes, volume: number) => {
        this.volumes[chanName] = volume
        Volumes.store(this.volumes)

        if (chanName === 'sound') this.setSoundVolume(volume)
        else this.setChannelVolume(chanName, volume)
    }

    private setSoundVolume = (volume: number) =>
        pipe(
            this.channels,
            R.mapWithIndex((name, chan) => {
                if (name !== 'music' && name !== 'voice') {
                    chan.setVolume(volume)
                }
            })
        )

    private setChannelVolume = (chanName: keyof Volumes, volume: number) =>
        pipe(
            R.lookup(chanName, this.channels),
            O.map(_ => _.setVolume(volume))
        )
}
