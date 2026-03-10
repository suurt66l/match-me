interface Props {
    errorMsg: string;
}

export default function ErrorParagraph({errorMsg} : Props) {
    return(
        <p className="text-red-600 bg-red-200 rounded-lg">❗{errorMsg}❗</p>
    );
}