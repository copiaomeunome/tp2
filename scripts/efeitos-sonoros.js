// Choro classico do Cubone: https://github.com/PokeAPI/cries
// Fanfara de evolucao de Pokemon Ruby & Sapphire:
// https://downloads.khinsider.com/game-soundtracks/album/pokemon-ruby-sapphire-music-super-complete
export class EfeitosSonoros {
    constructor(musica) {
        this.musica = musica;
        this.choro = new Audio(new URL('../assets/audio/cubone.ogg', import.meta.url));
        this.evolucao = new Audio(new URL('../assets/audio/evolucao.mp3', import.meta.url));
        // Passo sintetico em estilo retro, pois a caminhada comum no GBA nao tinha som proprio.
        this.passos = [0,1].map(() => {
            const audio = new Audio(new URL('../assets/audio/passo.wav', import.meta.url));
            audio.volume = 0.25;
            return {audio, ultimoPasso: -1};
        });
        this.choro.volume = 0.2;
        this.evolucao.volume = 0.7;
        this.ativados = true;
        this.eraNoite = false;
        this.jaEvoluiu = false;
        this.proximoChoro = 0;

        this.botao = document.createElement('button');
        this.botao.type = 'button';
        this.botao.addEventListener('click', () => {
            this.ativados = !this.ativados;
            if (!this.ativados) {
                this.parar(this.choro);
                this.parar(this.evolucao);
                for (const passo of this.passos) this.parar(passo.audio);
                this.restaurarMusica();
            } else {
                this.proximoChoro = 0;
            }
            this.atualizarBotao();
        });
        document.getElementById('controles-audio').appendChild(this.botao);
        this.atualizarBotao();
        this.evolucao.addEventListener('ended', () => this.restaurarMusica());
        this.evolucao.addEventListener('error', () => this.restaurarMusica());
    }

    atualizarBotao() {
        this.botao.textContent = this.ativados ? 'Desligar efeitos sonoros' : 'Ligar efeitos sonoros';
        this.botao.setAttribute('aria-pressed', String(this.ativados));
    }

    parar(audio) {
        audio.pause();
        audio.currentTime = 0;
    }

    restaurarMusica() {
        this.musica.audio.volume = this.musica.volumeNormal;
    }

    atualizarPassos(pokemons) {
        pokemons.forEach((pokemon, i) => {
            const passo = this.passos[i];
            if (!this.ativados || pokemon.tempoAndando <= 0) {
                if (passo.ultimoPasso !== -1) this.parar(passo.audio);
                passo.ultimoPasso = -1;
                return;
            }
            // A frequencia acompanha a animacao de cada Pokemon.
            const frequencia = i === 0 ? (pokemon.evoluido ? 8 : 10) : 12;
            const fase = Math.floor(pokemon.tempoAndando * frequencia / Math.PI);
            if (fase !== passo.ultimoPasso) {
                passo.audio.currentTime = 0;
                const tentativa = passo.audio.play();
                if (tentativa) tentativa.catch(() => {});
                passo.ultimoPasso = fase;
            }
        });
    }

    update(dt, periodo, evoluido, pokemons) {
        this.atualizarPassos(pokemons);
        const noite = periodo === 'noite' && !evoluido;
        if (!noite && this.eraNoite) this.parar(this.choro);
        if (noite && !this.eraNoite) this.proximoChoro = 0;
        this.eraNoite = noite;

        if (evoluido && !this.jaEvoluiu && this.ativados) {
            this.parar(this.choro);
            this.musica.audio.volume = 0.04;
            this.evolucao.currentTime = 0;
            const tentativa = this.evolucao.play();
            if (tentativa) tentativa.catch(() => this.restaurarMusica());
        }
        this.jaEvoluiu = evoluido;
        if (!noite || !this.ativados) return;
        this.proximoChoro -= dt;
        if (this.proximoChoro <= 0) {
            this.choro.currentTime = 0;
            const tentativa = this.choro.play();
            if (tentativa) tentativa.catch(() => {});
            this.proximoChoro = 3;
        }
    }
}
