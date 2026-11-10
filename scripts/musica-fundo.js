// Route 101, Pokémon Sapphire (Game Boy Advance).
// Fonte: https://www.zophar.net/music/gameboy-advance-gsf/pokemon-sapphire
export class MusicaFundo {
    constructor() {
        this.audio = new Audio(new URL("../assets/route-101-pokemon-sapphire.mp3", import.meta.url));
        this.audio.loop = true;
        this.volumeNormal = 0.5;
        this.audio.volume = this.volumeNormal;
        this.desativada = false;
        this.iniciada = false;

        this.botao = document.createElement("button");
        this.botao.type = "button";
        this.botao.textContent = "Ligar música";
        this.botao.setAttribute("aria-pressed", "false");
        document.getElementById("controles-audio").appendChild(this.botao);

        this.botao.addEventListener("click", () => {
            if (!this.audio.paused) {
                this.desativada = true;
                this.audio.pause();
                this.atualizarBotao();
            } else {
                this.desativada = false;
                this.tocar();
            }
        });
        // Navegadores exigem uma interação antes de iniciar áudio com som.
        const iniciarNaInteracao = (evento) => {
            if (evento.target === this.botao || this.desativada || this.iniciada) return;
            this.tocar();
        };
        document.addEventListener("pointerdown", iniciarNaInteracao);
        document.addEventListener("keydown", iniciarNaInteracao);
        this.audio.addEventListener("pause", () => this.atualizarBotao());
        this.audio.addEventListener("play", () => this.atualizarBotao());
        this.audio.addEventListener("error", () => {
            this.botao.textContent = "Música indisponível";
            this.botao.disabled = true;
        });
    }

    tocar() {
        const tentativa = this.audio.play();
        if (tentativa) tentativa.then(() => {
            this.iniciada = true;
            this.atualizarBotao();
        }).catch(() => this.atualizarBotao());
    }

    atualizarBotao() {
        const tocando = !this.audio.paused;
        this.botao.textContent = tocando ? "Desligar música" : "Ligar música";
        this.botao.setAttribute("aria-pressed", String(tocando));
    }
}
