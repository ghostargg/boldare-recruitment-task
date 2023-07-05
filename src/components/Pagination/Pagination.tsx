import { useCallback } from "react";

interface Props {
  total: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}


export const Pagination = ({ total, currentPage = 1, onPageChange }: Props) => {
  const lastPage = Math.ceil(total / 5);
  const handlePrevPage = () => {
    onPageChange(currentPage !== 1 ? currentPage - 1 : currentPage);
  };
  
  const handleNextPage = () => {
    onPageChange(currentPage !== lastPage ? currentPage + 1 : currentPage);
  };
  
  const pages = useCallback((amount: number) => {
    const numberedPages = [];
  
    for (let i = 1; i <= amount; i += 1) {
      numberedPages.push(i);
    }
  
    return numberedPages;
  }, [lastPage]);


  return (
    <ul className='pagination-list'>
      <li className='pagination-item'>
        <a
          className={currentPage === 1 ? 'pagination-previous is-disabled' : 'pagination-previous'}
          href='#prev'
          onClick={handlePrevPage}
        >
          <i className='fa-solid fa-chevron-left'></i>
        </a>
      </li>
      {pages(lastPage).map((page) => (
        <li key={page} className='pagination-item'>
          <a
            href={`#${page}`}
            className={currentPage === page ? 'pagination-link is-current' : 'pagination-link'}
            onClick={() => onPageChange(page)}
          >
            {page}
          </a>
        </li>
      ))}
      <li>
        <a
          className={currentPage === lastPage ? 'pagination-next is-disabled' : 'pagination-next'}
          href='#next'
          onClick={handleNextPage}
        >
          <i className='fa-solid fa-chevron-right'></i>
        </a>
      </li>
    </ul>
  );
};
