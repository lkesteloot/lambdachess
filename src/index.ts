
/**
 * Size of a chess board (number of ranks and files).
 */
const SIZE = 8;

/**
 * Remove all children from element.
 */
function clearElement(e: Element): void {
    while (e.firstChild) {
        e.removeChild(e.firstChild);
    }
}

/**
 * Piece color.
 */
enum Color {
    WHITE = 0,
    BLACK = 1,
}

/**
 * The type of piece, independent of color.
 */
class PieceType {
    // For white (0) and black (1). See Color enum.
    public readonly character: string[];

    constructor(character: string[]) {
        this.character = character;
    }

    public static ROOK = new PieceType(["\u2656", "\u265C"]);
    public static KNIGHT = new PieceType(["\u2658", "\u265E"]);
    public static BISHOP = new PieceType(["\u2657", "\u265D"]);
    public static KING = new PieceType(["\u2654", "\u265A"]);
    public static QUEEN = new PieceType(["\u2655", "\u265B"]);
    public static PAWN = new PieceType(["\u2659", "\u265F"]);

    public static INITIAL = [
        PieceType.ROOK, PieceType.KNIGHT, PieceType.BISHOP, PieceType.QUEEN,
        PieceType.KING, PieceType.BISHOP, PieceType.KNIGHT, PieceType.ROOK
    ];
}

/**
 * Actual piece on the board.
 */
class Piece {
    public readonly pieceType: PieceType;
    public readonly color: Color;

    constructor(pieceType: PieceType, color: Color) {
        this.pieceType = pieceType;
        this.color = color;
    }

    public character(): string {
        return this.pieceType.character[this.color];
    }
}

/**
 * A square can have a piece or be empty (null).
 */
type SquareContent = Piece | null;

type SquarePosition = { file: number, rank: number };

class Board {
    public readonly squares: SquareContent[][] = [];
    public selectedSquare: SquarePosition | null = null;
    public onSquareClick: (file: number, rank: number) => void = () => {};

    public constructor() {
        // Set up a standard chess game.
        for (let file = 0; file < SIZE; file++) {
            const rankPieces: SquareContent[] = [];

            for (let rank = 0; rank < SIZE; rank++) {
                const piece =
                    rank === 0 ? new Piece(PieceType.INITIAL[file], Color.WHITE)
                        : rank === 1 ? new Piece(PieceType.PAWN, Color.WHITE)
                            : rank === 6 ? new Piece(PieceType.PAWN, Color.BLACK)
                                : rank === 7 ? new Piece(PieceType.INITIAL[file], Color.BLACK)
                                    : null;

                rankPieces.push(piece);
            }

            this.squares.push(rankPieces);
        }
    }

    public get(pos: SquarePosition): SquareContent {
        return this.squares[pos.file][pos.rank];
    }

    public set(pos: SquarePosition, piece: SquareContent): void {
        this.squares[pos.file][pos.rank] = piece;
    }

    /**
     * Draw a chessboard into the element. Replaces what was in the element.
     */
    public draw(element: HTMLElement): void {
        clearElement(element);

        for (let rank = SIZE - 1; rank >= 0; rank--) {
            const rankElement = document.createElement("div");
            rankElement.classList.add("rank");
            element.append(rankElement);

            for (let file = 0; file < SIZE; file++) {
                const piece = this.squares[file][rank];

                const squareElement = document.createElement("div");
                squareElement.classList.add("square");
                const isDark = (rank + file) % 2 === 0;
                squareElement.classList.toggle("square-light", !isDark);
                squareElement.classList.toggle("square-dark", isDark);
                if (this.selectedSquare !== null &&
                    this.selectedSquare.file === file &&
                    this.selectedSquare.rank === rank) {

                    squareElement.classList.add("square-selected");
                }
                if (piece !== null) {
                    squareElement.innerText = piece.character();
                }
                squareElement.addEventListener("click", () => this.onSquareClick(file, rank));
                rankElement.append(squareElement);
            }
        }
    }
}

let sourceSquare: SquarePosition | null = null;

const body = document.querySelector("body") as HTMLElement;
const board = new Board();
board.onSquareClick = (file, rank) => {
    const pos = { file: file, rank: rank };
    const piece = board.get(pos);
    if (sourceSquare === null) {
        if (piece !== null) {
            board.selectedSquare = pos;
            sourceSquare = pos;
        }
    } else {
        if (pos.file !== sourceSquare.file || pos.rank !== sourceSquare.rank) {
            board.set(pos, board.get(sourceSquare));
            board.set(sourceSquare, null);
        }

        board.selectedSquare = null;
        sourceSquare = null;
    }
    board.draw(body);
};
board.draw(body);
