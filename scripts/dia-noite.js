export class DiaNoite{
    constructor(){
        this.tempo = 0;
        this.periodo = "dia";
        this.duracaoDia = 30;
        this.duracaoNoite = 30;
    }
    configurarDuracao(periodo,segundos){
        if(!Number.isFinite(segundos) || segundos < 1) return;
        const campo = periodo === "dia" ? "duracaoDia" : "duracaoNoite";
        if(this.periodo === periodo) this.tempo *= segundos / this[campo];
        this[campo] = segundos;
    }
    update(dt){
        this.tempo += dt;
        let duracao = this.periodo === "dia" ? this.duracaoDia : this.duracaoNoite;
        while(this.tempo >= duracao){
            this.tempo -= duracao;
            this.periodo = this.periodo === "dia" ? "noite" : "dia";
            duracao = this.periodo === "dia" ? this.duracaoDia : this.duracaoNoite;
        }
        const transicao = Math.max(0,(this.tempo / duracao - 0.8) / 0.2);
        const suave = transicao * transicao * (3 - 2 * transicao);
        const dia = this.periodo === "dia" ? 1 - suave : suave;
        const mistura = (noite,diaCor)=>noite.map((cor,i)=>cor + (diaCor[i] - cor) * dia);
        const ceu = mistura([0.015,0.025,0.065],[0.45,0.72,0.95]);
        return {
            ceu,
            corNeblina:ceu,
            ambiente:mistura([0.08,0.09,0.14],[0.5,0.5,0.5]),
            luzCor:mistura([0.035,0.045,0.08],[0.45,0.45,0.45]),
            luzPontual:mistura([0.02,0.025,0.04],[0.16,0.16,0.16])
        };
    }
}
