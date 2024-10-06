;;; -*-asm-*-

        load    (IRQ_FLAGADDR.a),IRQ_FLAG.a
        movei   #cpu_irq,IRQScratch0.a
        bset    #9+0,IRQ_FLAG.a
        load    (IRQ_SP.a),IRQ_RTS.a
        jump    (IRQScratch0.a)
        bclr    #3,IRQ_FLAG.a

        org     $f03010

        movei   #init,r0
        jump    (r0)
        nop

        org     $f03020
timer::
        load    (IRQ_FLAGADDR.a),IRQ_FLAG.a
        movei   #timer_irq,IRQScratch0.a
        bset    #9+2,IRQ_FLAG.a
        load    (IRQ_SP.a),IRQ_RTS.a
        jump    (IRQScratch0.a)
        bclr    #3,IRQ_FLAG.a

        org     $f03030
op::
        load    (IRQ_FLAGADDR.a),IRQ_FLAG.a
        movei   #op_irq,IRQScratch0.a
        bset    #9+3,IRQ_FLAG.a
        load    (IRQ_SP.a),IRQ_RTS.a
        jump    (IRQScratch0.a)
        bclr    #3,IRQ_FLAG.a

        org     $f03050
op_irq::
        move    obl0.a,IRQScratch0.a
        movei   #$1000,IRQScratch1.a
        move    obl_size.a,IRQScratch3.a
.l      loadp   (IRQScratch0.a),IRQScratch2.a
        addqt   #8,IRQScratch0.a
        subq    #1,IRQScratch3.a
        storep  IRQScratch2.a,(IRQScratch1.a)
        jr      ne,.l
        addq    #8,IRQScratch1.a

        moveq   #1,IRQScratch0.a
        moveta  IRQScratch0.a,VBLFlag

        moveq   #_VBLS_PER_FRAME,IRQScratch0.a
        load    (IRQScratch0.a),IRQScratch1.a
        addq    #1,IRQScratch1.a
        store   IRQScratch1.a,(IRQScratch0.a)

        movei   #$f00026,IRQScratch1.a
        jr      irq_return
        storew  IRQScratch1.a,(IRQScratch1.a) ; resume OP

timer_irq::
        nop
irq_return
        addqt   #2,IRQ_RTS.a
        moveta  IRQ_RTS.a,IRQ_RTS
        movefa  IRQ_SP,IRQ_SP.a
        store   IRQ_FLAG.a,(IRQ_FLAGADDR.a)
        jump    (IRQ_RTS.a)
        nop

cpu_irq:
        moveq   #1,IRQScratch0.a
        moveta  IRQScratch0.a,VBLFlag

        jr      irq_return
        nop
